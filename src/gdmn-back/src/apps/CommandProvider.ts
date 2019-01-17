import {AppAction, Application, GetSchemaCmd, PingCmd, QueryCmd} from "./base/Application";
import {Session} from "./base/Session";
import {ICmd, Task} from "./base/task/Task";
import {CreateAppCmd, DeleteAppCmd, GetAppsCmd, MainAction, MainApplication} from "./MainApplication";

export type Actions = AppAction & MainAction;

export class CommandProvider {

  private readonly _application: Application;

  constructor(application: Application) {
    this._application = application;
  }

  private static _verifyDeleteAppCmd(command: ICmd<"DELETE_APP", unknown>): command is DeleteAppCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "uid" in command.payload;
  }

  private static _verifyCreateAppCmd(command: ICmd<"CREATE_APP", any>): command is CreateAppCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "alias" in command.payload
      && typeof command.payload.alias === "string"
      && "external" in command.payload
      && typeof command.payload.external === "boolean";
    // TODO
  }

  private static _verifyPingCmd(command: ICmd<"PING">): command is PingCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "steps" in command.payload
      && typeof command.payload.steps === "number"
      && "delay" in command.payload
      && typeof command.payload.delay === "number";
  }

  private static _verifyQueryCmd(command: ICmd<"QUERY">): command is QueryCmd {
    return typeof command.payload === "object"
      && !!command.payload;
    // TODO
  }

  public receive(session: Session, command: ICmd<Actions, unknown>): Task<any, any> {
    switch (command.action) {
      // ------------------------------For MainApplication
      case "DELETE_APP": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        if (!CommandProvider._verifyDeleteAppCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushDeleteAppCmd(session, command);
      }
      case "CREATE_APP": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        if (!CommandProvider._verifyCreateAppCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushCreateAppCmd(session, command);
      }
      case "GET_APPS": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        return this._application.pushGetAppsCmd(session, command as GetAppsCmd);
      }
      // ------------------------------For all application
      case "PING": {
        if (!CommandProvider._verifyPingCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushPingCmd(session, command);
      }
      case "GET_SCHEMA": {
        return this._application.pushGetSchemaCmd(session, command as GetSchemaCmd);
      }
      case "QUERY": {
        if (!CommandProvider._verifyQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushQueryCmd(session, command);
      }
      default: {
        throw new Error("Unsupported action");
      }
    }
  }
}
