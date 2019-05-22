import {AppCommandProvider} from "./base/AppCommandProvider";
import {AppAction} from "./base/Application";
import {Session} from "./base/session/Session";
import {ICmd, Task} from "./base/task/Task";
import {
  CreateAppCmd,
  DeleteAppCmd,
  GetAppsCmd,
  GetAppTemplatesCmd,
  GetMainSessionsInfoCmd,
  MainAction,
  MainApplication
} from "./MainApplication";

export type Actions = AppAction | MainAction;

export class MainCommandProvider extends AppCommandProvider {

  private static _verifyDeleteAppCmd(command: ICmd<Actions, unknown>): command is DeleteAppCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "uid" in command.payload;
  }

  private static _verifyCreateAppCmd(command: ICmd<Actions, any>): command is CreateAppCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "alias" in command.payload
      && typeof command.payload.alias === "string"
      && "external" in command.payload
      && typeof command.payload.external === "boolean";
    // TODO
  }

  private static _verifyMainSessionsInfoCmd(command: ICmd<Actions, any>): command is GetMainSessionsInfoCmd {
    return typeof command.payload === "object"
      && !!command.payload;
    // TODO
  }

  public receive(session: Session, command: ICmd<Actions, unknown>): Task<any, any> {
    switch (command.action) {
      case "GET_APP_TEMPLATES": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        return this._application.pushGetAppTemplatesCmd(session, command as GetAppTemplatesCmd);
      }
      case "DELETE_APP": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        if (!MainCommandProvider._verifyDeleteAppCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushDeleteAppCmd(session, command);
      }
      case "CREATE_APP": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        if (!MainCommandProvider._verifyCreateAppCmd(command)) {
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
      case "GET_MAIN_SESSIONS_INFO": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        if (!MainCommandProvider._verifyMainSessionsInfoCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushMainSessionsInfoCmd(session, command);
      }
      default: {
        return super.receive(session, command as ICmd<AppAction, unknown>);
      }
    }
  }
}
