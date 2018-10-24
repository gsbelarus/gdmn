import config from "config";
import jwt from "jsonwebtoken";
import {Middleware} from "koa";
import passport from "koa-passport";
import {ExtractJwt, Strategy as JWTStrategy} from "passport-jwt";
import {Strategy as LocalStrategy} from "passport-local";
import {IUser, MainApplication} from "./apps/MainApplication";
import {ErrorCodes, throwCtx} from "./ErrorCodes";

const JWT_SECRET: string = config.get("server.jwtSecret");
const USERNAME_FIELD = "login";
const PASSWORD_FIELD = "password";

const jwtFromRequest = ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  ExtractJwt.fromBodyField("access_token"),
  ExtractJwt.fromUrlQueryParameter("access_token")
]);

export function createAccessJwtToken(user: IUser): string {
  return jwt.sign({
    id: user.id
  }, JWT_SECRET, {
    expiresIn: "3h"
  });
}

export function createRefreshJwtToken(user: IUser): string {
  return jwt.sign({
    id: user.id,
    isRefresh: true
  }, JWT_SECRET, {
    expiresIn: "7d"
  });
}

export function getPayloadFromJwtToken(token: string): any {
  const verified = jwt.verify(token, JWT_SECRET);

  if (verified) {
    const payload = jwt.decode(token);
    if (!payload) {
      throw new Error("No payload");
    }

    return payload;
  }

  throw new Error("Token not valid");
}

passport.use(new LocalStrategy({
  usernameField: USERNAME_FIELD,
  passwordField: PASSWORD_FIELD,
  passReqToCallback: true,
  session: false
}, async (req: any, login, password, done) => {
  try {
    const mainApplication = req.ctx.state.mainApplication as MainApplication;
    if (mainApplication) {
      const user = await mainApplication.checkUserPassword(login, password);
      if (user) {
        return done(null, user);
      }
      throwCtx(req.ctx, 401, "Invalid login or password", ErrorCodes.INVALID_ARGUMENTS,
        [USERNAME_FIELD, PASSWORD_FIELD]);
    }
    throwCtx(req.ctx, 500, "ApplicationManager is not provided", ErrorCodes.INTERNAL);
  } catch (error) {
    return done(error);
  }
}));

passport.use("jwt", new JWTStrategy({
    jwtFromRequest,
    secretOrKey: JWT_SECRET,
    passReqToCallback: true
  },
  async (req: any, payload: any, done: any) => {
    try {
      const mainApplication = req.ctx.state.mainApplication as MainApplication;
      if (mainApplication) {
        if (!payload.isRefresh) {
          const user = await mainApplication.findUser({id: payload.id});
          if (user) {
            return done(null, user);
          }
        }
        throwCtx(req.ctx, 401, "Invalid access token", ErrorCodes.INVALID_AUTH_TOKEN);
      }
      throwCtx(req.ctx, 500, "ApplicationManager is not provided", ErrorCodes.INTERNAL);
    } catch (error) {
      done(error);
    }
  }
));

passport.use("refresh_jwt", new JWTStrategy({
    jwtFromRequest,
    secretOrKey: JWT_SECRET,
    passReqToCallback: true
  },
  async (req: any, payload: any, done: any) => {
    try {
      if (req.ctx.state.mainApplication) {
        if (payload.isRefresh) {
          const user = await req.ctx.state.mainApplication.findUser({id: payload.id});
          if (user) {
            return done(null, user);
          }
        }
        throwCtx(req.ctx, 401, "Invalid refresh token", ErrorCodes.INVALID_AUTH_TOKEN);
      }
      throwCtx(req.ctx, 500, "ApplicationManager is not provided", ErrorCodes.INTERNAL);
    } catch (error) {
      done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// type hack
class KoaPassport extends passport.KoaPassport {
}

export function getAuthMiddleware(strategyName: string, passportInstance: KoaPassport): Middleware {
  return async (ctx, next) => {
    await passportInstance.authenticate(strategyName, (error: Error, user: any, info: Error) => {
      if (info) {
        throwCtx(ctx, 401, info.message, ErrorCodes.INVALID_AUTH);
      }
      if (error) {
        throw error;
      }
      return ctx.login(user, {session: false});
    })(ctx, next);
    await next();
  };
}

export default passport;
