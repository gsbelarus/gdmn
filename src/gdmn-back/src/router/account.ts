import Router from "koa-router";
import {MainApplication} from "../apps/MainApplication";
import {assertCtx, ErrorCodes, throwCtx} from "../ErrorCodes";
import passport, {createAccessJwtToken, createRefreshJwtToken, getAuthMiddleware} from "../passport";

function isAuthExists(obj: any): obj is { login: string, password: string } {
  return obj && obj.login && obj.password;
}

export default new Router()
  .post("/", async (ctx) => {
    if (isAuthExists(ctx.request.body)) {
      const mainApplication = ctx.state.mainApplication as MainApplication;
      const duplicate = await mainApplication.findUser({login: ctx.request.body.login});
      assertCtx(!duplicate, ctx, 401, "Login already exists", ErrorCodes.NOT_UNIQUE, ["login"]);

      const user = await mainApplication.addUser({
        login: ctx.request.body.login,
        password: ctx.request.body.password,
        admin: false
      });
      return ctx.body = {
        access_token: createAccessJwtToken(user),
        refresh_token: createRefreshJwtToken(user),
        token_type: "Bearer"
      };
    }
    throwCtx(ctx, 400, "Login or password is not provided", ErrorCodes.INVALID_ARGUMENTS);
  })
  .post("/login", getAuthMiddleware("local", passport), (ctx) => {
    return ctx.body = {
      access_token: createAccessJwtToken(ctx.state.user),
      refresh_token: createRefreshJwtToken(ctx.state.user),
      token_type: "Bearer"
    };
  })
  .post("/refresh", getAuthMiddleware("refresh_jwt", passport), (ctx) => {
    return ctx.body = {
      access_token: createAccessJwtToken(ctx.state.user),
      refresh_token: createRefreshJwtToken(ctx.state.user),
      token_type: "Bearer"
    };
  });
