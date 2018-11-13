import config from "config";
import jwt from "jsonwebtoken";
import {StompHeaders} from "stomp-protocol";
import {Application} from "../apps/base/Application";
import {IUser, MainApplication} from "../apps/MainApplication";
import {ErrorCode, ServerError} from "./ServerError";

export interface ITokens extends StompHeaders {
  "access-token": string;
  "refresh-token": string;
}

export class Utils {

  public static readonly JWT_SECRET: string = config.get("server.jwtSecret");

  public static createAccessJwtToken(user: IUser): string {
    return jwt.sign({
      id: user.id
    }, Utils.JWT_SECRET, {
      expiresIn: "3h"
    });
  }

  public static createRefreshJwtToken(user: IUser): string {
    return jwt.sign({
      id: user.id,
      isRefresh: true
    }, Utils.JWT_SECRET, {
      expiresIn: "7d"
    });
  }

  public static getPayloadFromJwtToken(token: string): any {
    const verified = jwt.verify(token, Utils.JWT_SECRET);

    if (verified) {
      const payload = jwt.decode(token);
      if (!payload) {
        throw new Error("No payload");
      }

      return payload;
    }

    throw new Error("Token not valid");
  }

  public static checkContentType(headers?: StompHeaders): void | never {
    const contentType = headers!["content-type"];
    if (contentType !== "application/json;charset=utf-8") {
      throw new ServerError(ErrorCode.UNSUPPORTED,
        `Unsupported content-type '${contentType}'; supported - 'application/json;charset=utf-8'`);
    }
  }

  public static async getApplication(mainApplication: MainApplication,
                                     userKey: number,
                                     uid?: string): Promise<Application> {
    if (uid) {
      // auth on main and get application
      const session = await mainApplication.sessionManager.open(userKey);
      try {
        return await mainApplication.getApplication(session, uid);
      } finally {
        await session.forceClose();
      }
    } else {
      // use main as application
      return mainApplication;
    }
  }

  public static async authorize(mainApplication: MainApplication,
                                token: string): Promise<{ userKey: number, newTokens?: ITokens }> {
    const payload = Utils.getPayloadFromJwtToken(token);
    const user = await mainApplication.findUser({id: payload.id});
    if (!user) {
      throw new ServerError(ErrorCode.NOT_FOUND, "No users for token");
    }
    const result: { userKey: number, newTokens?: ITokens } = {userKey: user.id};
    if (payload.isRefresh) {
      result.newTokens = {
        "access-token": Utils.createAccessJwtToken(user),
        "refresh-token": Utils.createRefreshJwtToken(user)
      };
    }
    return result;
  }

  public static async login(mainApplication: MainApplication,
                            login: string,
                            password: string): Promise<{ userKey: number, newTokens: ITokens }> {
    const user = await mainApplication.checkUserPassword(login, password);
    if (!user) {
      throw new ServerError(ErrorCode.INVALID, "Incorrect login or password");
    }
    return {
      userKey: user.id,
      newTokens: {
        "access-token": Utils.createAccessJwtToken(user),
        "refresh-token": Utils.createRefreshJwtToken(user)
      }
    };
  }

  public static async createUser(mainApplication: MainApplication,
                                 login: string,
                                 password: string): Promise<{ userKey: number, newTokens: ITokens }> {
    const duplicate = await mainApplication.findUser({login});
    if (duplicate) {
      throw new ServerError(ErrorCode.NOT_UNIQUE, "Login already exists");
    }
    const user = await mainApplication.addUser({
      login,
      password,
      admin: false
    });
    if (!user) {
      throw new ServerError(ErrorCode.UNAUTHORIZED, "User is not created");
    }
    return {
      userKey: user.id,
      newTokens: {
        "access-token": Utils.createAccessJwtToken(user),
        "refresh-token": Utils.createRefreshJwtToken(user)
      }
    };
  }
}
