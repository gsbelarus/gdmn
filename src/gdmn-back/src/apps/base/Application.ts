import {AConnection} from "gdmn-db";
import {DataSource} from "gdmn-er-bridge";
import {ERModel, IEntityQueryInspector, IERModel, IQueryResponse} from "gdmn-orm";
import log4js, {Logger} from "log4js";
import {ADatabase, IDBDetail} from "../../db/ADatabase";
import {Session} from "./Session";
import {SessionManager} from "./SessionManager";
import {ICommand, Level, Task} from "./task/Task";

export type AppAction = "BEGIN_TRANSACTION" | "COMMIT_TRANSACTION" | "ROLLBACK_TRANSACTION" |
  "PING" | "GET_SCHEMA" | "QUERY";

export type AppCommand<A extends AppAction, P = undefined> = ICommand<A, P>;

export interface ITPayload {
  transactionKey?: string;
}

export type BeginTransCommand = AppCommand<"BEGIN_TRANSACTION">;
export type CommitTransCommand = AppCommand<"COMMIT_TRANSACTION", { transactionKey: string; }>;
export type RollbackTransCommand = AppCommand<"ROLLBACK_TRANSACTION", { transactionKey: string; }>;

export type PingCommand = AppCommand<"PING", { steps: number; delay: number; } & ITPayload>;
export type GetSchemaCommand = AppCommand<"GET_SCHEMA">;
export type QueryCommand = AppCommand<"QUERY", IEntityQueryInspector & ITPayload>;

export abstract class Application extends ADatabase {

  protected _sessionLogger = log4js.getLogger("Session");
  protected _taskLogger = log4js.getLogger("Task");

  private readonly _erModel: ERModel = new ERModel(new DataSource(this.connectionPool));
  private readonly _sessionManager = new SessionManager(this._erModel, this._sessionLogger);

  protected constructor(dbDetail: IDBDetail, logger: Logger) {
    super(dbDetail, logger);
  }

  get erModel(): ERModel {
    return this._erModel;
  }

  get sessionManager(): SessionManager {
    return this._sessionManager;
  }

  public pushBeginTransCommand(session: Session, command: BeginTransCommand): Task<BeginTransCommand, string> {
    this._checkSession(session);
    this._checkBusy();

    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this._taskLogger,
      worker: async (context) => {
        const transaction = await this._erModel.startTransaction(context.session.connection);
        return context.session.addTransaction(transaction);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushCommitTransCommand(session: Session, command: CommitTransCommand): Task<CommitTransCommand, void> {
    this._checkSession(session);
    this._checkBusy();

    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this._taskLogger,
      worker: async (context) => {
        const {transactionKey} = context.command.payload;

        const transaction = context.session.getTransaction(transactionKey);
        if (!transaction) {
          throw new Error("Transaction is not found");
        }
        await transaction.commit();
        context.session.removeTransaction(transactionKey);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushRollbackTransCommand(session: Session, command: RollbackTransCommand): Task<RollbackTransCommand, void> {
    this._checkSession(session);
    this._checkBusy();

    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this._taskLogger,
      worker: async (context) => {
        const {transactionKey} = context.command.payload;

        const transaction = context.session.getTransaction(transactionKey);
        if (!transaction) {
          throw new Error("Transaction is not found");
        }
        await transaction.rollback();
        context.session.removeTransaction(transactionKey);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushPingCommand(session: Session, command: PingCommand): Task<PingCommand, void> {
    this._checkSession(session);
    this._checkBusy();

    const task = new Task({
      session,
      command,
      level: Level.USER,
      logger: this._taskLogger,
      worker: async (context) => {
        const {steps, delay} = context.command.payload;

        const stepPercent = 100 / steps;
        context.progress.increment(0, `Process ping...`);
        for (let i = 0; i < steps; i++) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          context.progress.increment(stepPercent, `Process ping... Complete step: ${i + 1}`);
          await context.checkStatus();
        }

        if (!this.connected) {
          this._logger.error("Application is not connected");
          throw new Error("Application is not connected");
        }
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushGetSchemaCommand(session: Session, command: GetSchemaCommand): Task<GetSchemaCommand, IERModel> {
    this._checkSession(session);
    this._checkBusy();

    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this._taskLogger,
      worker: () => this.erModel.serialize()
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushQueryCommand(session: Session, command: QueryCommand): Task<QueryCommand, IQueryResponse> {
    this._checkSession(session);
    this._checkBusy();

    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this._taskLogger,
      worker: async (context) => {
        const {transactionKey} = context.command.payload;

        const transaction = context.session.getTransaction(transactionKey || "");
        const result = await this._erModel.query(context.command.payload, context.session.connection, transaction);
        await context.checkStatus();
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  protected _checkSession(session: Session): void | never {
    if (session.closed || !session.active) {
      this._logger.error("Session is closed");
      throw new Error("Session is closed");
    }
    if (!this._sessionManager.includes(session)) {
      this._logger.error("Session does not belong to the application");
      throw new Error("Session does not belong to the application");
    }
  }

  protected async _onCreate(_connection: AConnection): Promise<void> {
    await super._onCreate(_connection);

    await this._erModel.init();
  }

  protected async _onConnect(): Promise<void> {
    await super._onConnect();

    await this._erModel.init();
  }

  protected async _onDisconnect(): Promise<void> {
    await super._onDisconnect();

    await this._sessionManager.closeAll();
    this._logger.info("All session are closed");
  }
}
