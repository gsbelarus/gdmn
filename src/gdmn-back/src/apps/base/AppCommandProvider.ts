import {
  AppAction,
  Application,
  FetchQueryCmd,
  GetSchemaCmd,
  InterruptCmd,
  QueryCmd,
  PingCmd,
  ReloadSchemaCmd
} from "./Application";
import {Session} from "./Session";
import {ICmd, Task} from "./task/Task";

export class AppCommandProvider {

  protected readonly _application: Application;

  constructor(application: Application) {
    this._application = application;
  }

  private static _verifyPingCmd(command: ICmd<AppAction, any>): command is PingCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "steps" in command.payload
      && typeof command.payload.steps === "number"
      && "delay" in command.payload
      && typeof command.payload.delay === "number";
  }

  private static _verifyInterruptCmd(command: ICmd<AppAction, any>): command is InterruptCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "taskKey" in command.payload
      && typeof command.payload.taskKey === "string";
  }

  private static _verifyQueryCmd(command: ICmd<AppAction, any>): command is QueryCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "query" in command.payload
      && typeof command.payload.query === "object";
    // TODO
  }

  private static _verifyFetchQueryCmd(command: ICmd<AppAction, any>): command is FetchQueryCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "taskKey" in command.payload
      && typeof command.payload.taskKey === "string"
      && "rowsCount" in command.payload
      && typeof command.payload.rowsCount === "number";
  }

  public receive(session: Session, command: ICmd<AppAction, unknown>): Task<any, any> {
    if (!command.payload) {
      (command.payload as any) = {};
    }
    switch (command.action) {
      case "PING": {
        if (!AppCommandProvider._verifyPingCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushPingCmd(session, command);
      }
      case "INTERRUPT": {
        if (!AppCommandProvider._verifyInterruptCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushInterruptCmd(session, command);
      }
      case "RELOAD_SCHEMA": {
        return this._application.pushReloadSchemaCmd(session, command as ReloadSchemaCmd);
      }
      case "GET_SCHEMA": {
        return this._application.pushGetSchemaCmd(session, command as GetSchemaCmd);
      }
      case "QUERY": {
        if (!AppCommandProvider._verifyQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushQueryCmd(session, command);
      }
      case "FETCH_QUERY": {
        if (!AppCommandProvider._verifyFetchQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushFetchQueryCmd(session, command);
      }
      default: {
        throw new Error("Unsupported action");
      }
    }
  }
}
