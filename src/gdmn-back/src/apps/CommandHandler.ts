import {Application} from "./base/Application";
import {Session} from "./base/Session";
import {ICmd, Task} from "./base/task/Task";
import {MainApplication} from "./MainApplication";

export class CommandHandler {

  private readonly _application: Application;

  constructor(application: Application) {
    this._application = application;
  }

  public receive(session: Session, command: ICmd<any, any>): Task<any, any> | undefined {
    switch (command.action) {
      // ------------------------------For MainApplication
      case "DELETE_APP": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        return this._application.pushDeleteAppCmd(session, command);
      }
      case "CREATE_APP": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        return this._application.pushCreateAppCmd(session, command);
      }
      case "GET_APPS": {
        if (!(this._application instanceof MainApplication)) {
          throw new Error("Unsupported command");
        }
        return this._application.pushGetAppsCmd(session, command);
      }
      // ------------------------------For all application
      case "BEGIN_TRANSACTION": {
        return this._application.pushBeginTransCmd(session, command);
      }
      case "COMMIT_TRANSACTION": {
        return this._application.pushCommitTransCmd(session, command);
      }
      case "ROLLBACK_TRANSACTION": {
        return this._application.pushRollbackTransCmd(session, command);
      }
      case "PING": {
        return this._application.pushPingCmd(session, command);
      }
      case "GET_SCHEMA": {
        return this._application.pushGetSchemaCmd(session, command);
      }
      case "QUERY": {
        return this._application.pushQueryCmd(session, command);
      }
    }
  }
}
