import {AppCommandProvider} from "./base/AppCommandProvider";
import {AppAction} from "./base/Application";
import {Session} from "./base/session/Session";
import {ICmd, Task} from "./base/task/Task";
import {
  CreateAppCmd,
  DeleteAppCmd,
  GetAppsCmd,
  GetAppTemplatesCmd,
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
      default: {
        return super.receive(session, command as ICmd<AppAction, unknown>);
      }
    }
  }
}
