import {AppAction, Application, GetSchemaCmd, PingCmd, QueryCmd} from "./Application";
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

  private static _verifyQueryCmd(command: ICmd<AppAction, any>): command is QueryCmd {
    return typeof command.payload === "object"
      && !!command.payload;
    // TODO
  }

  public receive(session: Session, command: ICmd<AppAction, unknown>): Task<any, any> {
    switch (command.action) {
      case "PING": {
        if (!AppCommandProvider._verifyPingCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushPingCmd(session, command);
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
      default: {
        throw new Error("Unsupported action");
      }
    }
  }
}
