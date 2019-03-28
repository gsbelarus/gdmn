import {
  AppAction,
  Application,
  DefineEntityCmd,
  DeleteCmd,
  DemoCmd,
  FetchQueryCmd,
  FetchSqlQueryCmd,
  GetSchemaCmd,
  InsertCmd,
  InterruptCmd,
  PingCmd,
  PrepareQueryCmd,
  PrepareSqlQueryCmd,
  QueryCmd,
  ReloadSchemaCmd,
  SqlQueryCmd,
  UpdateCmd
} from "./Application";
import {Session} from "./session/Session";
import {ICmd, Task} from "./task/Task";

export class AppCommandProvider {

  protected readonly _application: Application;

  constructor(application: Application) {
    this._application = application;
  }

  private static _verifyDemoCmd(command: ICmd<AppAction, any>): command is DemoCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "withError" in command.payload
      && typeof command.payload.withError === "boolean";
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

  private static _verifyDefineEntityCmd(command: ICmd<AppAction, any>): command is DefineEntityCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "entity" in command.payload
      && typeof command.payload.entity === "string"
      && "pkValues" in command.payload
      && Array.isArray(command.payload.pkValues);
  }

  private static _verifyQueryCmd(command: ICmd<AppAction, any>): command is QueryCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "query" in command.payload
      && typeof command.payload.query === "object";
    // TODO
  }

  private static _verifySqlQueryCmd(command: ICmd<AppAction, any>): command is SqlQueryCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "select" in command.payload
      && typeof command.payload.select === "string"
      && "params" in command.payload
      && typeof command.payload.params === "object";
  }

  private static _verifyPrepareQueryCmd(command: ICmd<AppAction, any>): command is PrepareQueryCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "query" in command.payload
      && typeof command.payload.query === "object";
    // TODO
  }

  private static _verifyPrepareSqlQueryCmd(command: ICmd<AppAction, any>): command is PrepareSqlQueryCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "select" in command.payload
      && typeof command.payload.select === "string"
      && "params" in command.payload
      && typeof command.payload.params === "object";
  }

  private static _verifyFetchQueryCmd(command: ICmd<AppAction, any>): command is FetchQueryCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "taskKey" in command.payload
      && typeof command.payload.taskKey === "string"
      && "rowsCount" in command.payload
      && typeof command.payload.rowsCount === "number";
  }

  private static _verifyFetchSqlQueryCmd(command: ICmd<AppAction, any>): command is FetchSqlQueryCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "taskKey" in command.payload
      && typeof command.payload.taskKey === "string"
      && "rowsCount" in command.payload
      && typeof command.payload.rowsCount === "number";
  }

  private static _verifyInsertCmd(command: ICmd<AppAction, any>): command is InsertCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "insert" in command.payload
      && typeof command.payload.insert === "object";
    // TODO
  }

  private static _verifyUpdateCmd(command: ICmd<AppAction, any>): command is UpdateCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "update" in command.payload
      && typeof command.payload.update === "object";
    // TODO
  }

  private static _verifyDeleteCmd(command: ICmd<AppAction, any>): command is DeleteCmd {
    return typeof command.payload === "object"
      && !!command.payload
      && "delete" in command.payload
      && typeof command.payload.delete === "object";
    // TODO
  }

  public receive(session: Session, command: ICmd<AppAction, unknown>): Task<any, any> {
    if (!command.payload) {
      (command.payload as any) = {};
    }
    switch (command.action) {
      case "DEMO": {
        if (!AppCommandProvider._verifyDemoCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushDemoCmd(session, command);
      }
      case "PING": {
        if (!AppCommandProvider._verifyPingCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushPingCmd(session, command as any);
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
      case "DEFINE_ENTITY": {
        if (!AppCommandProvider._verifyDefineEntityCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushDefineEntityCmd(session, command);
      }
      case "QUERY": {
        if (!AppCommandProvider._verifyQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushQueryCmd(session, command);
      }
      case "SQL_QUERY": {
        if (!AppCommandProvider._verifySqlQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushSqlQueryCmd(session, command);
      }
      case "PREPARE_QUERY": {
        if (!AppCommandProvider._verifyPrepareQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushPrepareQueryCmd(session, command);
      }
      case "PREPARE_SQL_QUERY": {
        if (!AppCommandProvider._verifyPrepareSqlQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushPrepareSqlQueryCmd(session, command);
      }
      case "FETCH_QUERY": {
        if (!AppCommandProvider._verifyFetchQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushFetchQueryCmd(session, command);
      }
      case "FETCH_SQL_QUERY": {
        if (!AppCommandProvider._verifyFetchSqlQueryCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushFetchSqlQueryCmd(session, command);
      }
      case "INSERT": {
        if (!AppCommandProvider._verifyInsertCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushInsertCmd(session, command);
      }
      case "UPDATE": {
        if (!AppCommandProvider._verifyUpdateCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushUpdateCmd(session, command);
      }
      case "DELETE": {
        if (!AppCommandProvider._verifyDeleteCmd(command)) {
          throw new Error(`Incorrect ${command.action} command`);
        }
        return this._application.pushDeleteCmd(session, command);
      }
      default: {
        throw new Error("Unsupported action");
      }
    }
  }
}
