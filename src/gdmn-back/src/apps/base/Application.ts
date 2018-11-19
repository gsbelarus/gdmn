import {DataSource} from "gdmn-er-bridge";
import {ERModel, IEntityQueryInspector, IERModel, IQueryResponse} from "gdmn-orm";
import log4js, {Logger} from "log4js";
import {ADatabase, DBStatus, IDBDetail} from "../../db/ADatabase";
import {Session, SessionStatus} from "./Session";
import {SessionManager} from "./SessionManager";
import {ICmd, Level, Task} from "./task/Task";

export type AppAction = "BEGIN_TRANSACTION" | "COMMIT_TRANSACTION" | "ROLLBACK_TRANSACTION" |
  "PING" | "GET_SCHEMA" | "QUERY";

export type AppCmd<A extends AppAction, P = undefined> = ICmd<A, P>;

export interface ITPayload {
  transactionKey?: string;
}

export type BeginTransCmd = AppCmd<"BEGIN_TRANSACTION">;
export type CommitTransCmd = AppCmd<"COMMIT_TRANSACTION", { transactionKey: string; }>;
export type RollbackTransCmd = AppCmd<"ROLLBACK_TRANSACTION", { transactionKey: string; }>;

export type PingCmd = AppCmd<"PING", { steps: number; delay: number; } & ITPayload>;
export type GetSchemaCmd = AppCmd<"GET_SCHEMA">;
export type QueryCmd = AppCmd<"QUERY", IEntityQueryInspector & ITPayload>;

export abstract class Application extends ADatabase {

  public sessionLogger = log4js.getLogger("Session");
  public taskLogger = log4js.getLogger("Task");

  public readonly erModel: ERModel = new ERModel(new DataSource(this.connectionPool));
  public readonly sessionManager = new SessionManager(this.erModel, this.sessionLogger);

  protected constructor(dbDetail: IDBDetail, logger: Logger) {
    super(dbDetail, logger);
  }

  public pushBeginTransCmd(session: Session, command: BeginTransCmd): Task<BeginTransCmd, string> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this._checkSession(session);

        const transaction = await this.erModel.startTransaction(context.session.connection);
        return context.session.addTransaction(transaction);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushCommitTransCmd(session: Session, command: CommitTransCmd): Task<CommitTransCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this._checkSession(session);

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

  public pushRollbackTransCmd(session: Session, command: RollbackTransCmd): Task<RollbackTransCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this._checkSession(session);

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

  public pushPingCmd(session: Session, command: PingCmd): Task<PingCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.USER,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this._checkSession(session);

        const {steps, delay} = context.command.payload;

        const stepPercent = 100 / steps;
        context.progress.increment(0, `Process ping...`);
        for (let i = 0; i < steps; i++) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          context.progress.increment(stepPercent, `Process ping... Complete step: ${i + 1}`);
          await context.checkStatus();
        }

        await this.waitProcess();
        if (this.status !== DBStatus.CONNECTED) {
          this._logger.error("Application is not connected");
          throw new Error("Application is not connected");
        }
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushGetSchemaCmd(session: Session, command: GetSchemaCmd): Task<GetSchemaCmd, IERModel> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async () => {
        await this.waitProcess();
        this._checkSession(session);

        return this.erModel.serialize();
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushQueryCmd(session: Session, command: QueryCmd): Task<QueryCmd, IQueryResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this._checkSession(session);

        const {transactionKey} = context.command.payload;

        const transaction = context.session.getTransaction(transactionKey || "");
        const result = await this.erModel.query(context.command.payload, context.session.connection, transaction);
        await context.checkStatus();
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  protected _checkSession(session: Session): void | never {
    if (session.status !== SessionStatus.OPENED) {
      const message = "Session is closed";
      this._logger.warn(message);
      throw new Error(message);
    }
    if (!session.active) {
      const message = "Session is not active";
      this._logger.warn(message);
      throw new Error(message);
    }
    if (!this.sessionManager.includes(session)) {
      const message = "Session does not belong to the application";
      this._logger.warn(message);
      throw new Error(message);
    }
  }

  protected async _onCreate(): Promise<void> {
    await super._onCreate();

    await this.erModel.init();
  }

  protected async _onConnect(): Promise<void> {
    await super._onConnect();

    await this.erModel.init();
  }

  protected async _onDisconnect(): Promise<void> {
    await super._onDisconnect();

    await this.sessionManager.closeAll();
    this._logger.info("All session are closed");
  }
}
