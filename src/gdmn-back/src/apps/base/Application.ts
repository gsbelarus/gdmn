import {AccessMode, AConnection} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {EntityQuery, ERModel, IEntityQueryInspector, IERModel, IEntityQueryResponse} from "gdmn-orm";
import log4js from "log4js";
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

  public readonly erModel: ERModel = new ERModel();
  public readonly sessionManager = new SessionManager(this.connectionPool, this.sessionLogger);

  protected constructor(dbDetail: IDBDetail) {
    super(dbDetail);
  }

  public pushBeginTransCmd(session: Session, command: BeginTransCmd): Task<BeginTransCmd, string> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this.checkSession(session);

        return await context.session.startBridge();
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
        this.checkSession(session);

        const {transactionKey} = context.command.payload;

        await context.session.commitBridge(transactionKey);
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
        this.checkSession(session);

        const {transactionKey} = context.command.payload;

        await context.session.rollbackBridge(transactionKey);
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
        this.checkSession(session);

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
        this.checkSession(session);

        return this.erModel.serialize();
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushQueryCmd(session: Session, command: QueryCmd): Task<QueryCmd, IEntityQueryResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitProcess();
        this.checkSession(session);

        const {transactionKey} = context.command.payload;

        const result = await Session.executeERBridge(transactionKey, context.session,
          (erBridge) => erBridge.query(EntityQuery.inspectorToObject(this.erModel, context.command.payload)));
        await context.checkStatus();
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public checkSession(session: Session): void | never {
    if (session.status !== SessionStatus.OPENED) {
      this._logger.warn("Session id#%s is not opened", session.id);
      throw new Error("Session is not opened");
    }
    if (!session.connection.connected) {
      this._logger.warn("Session id#%s connection is not connected", session.id);
      throw new Error("Session connection is not connected");
    }
    if (!this.sessionManager.includes(session)) {
      this._logger.warn("Session id#%s does not belong to the application", session.id);
      throw new Error("Session does not belong to the application");
    }
  }

  protected async _onCreate(): Promise<void> {
    await super._onCreate();

    await this._init();
  }

  protected async _onConnect(): Promise<void> {
    await super._onConnect();

    await this._init();
  }

  protected async _onDisconnect(): Promise<void> {
    await super._onDisconnect();

    await this.sessionManager.forceCloseAll();
    this._logger.info("All session are closed");
  }

  private async _init(): Promise<void> {
    await this._executeConnection(async (connection) => {
      await ERBridge.initDatabase(connection);

      await AConnection.executeTransaction({
        connection,
        options: {accessMode: AccessMode.READ_ONLY},
        callback: (transaction) => ERBridge.reloadERModel(connection, transaction, this.erModel)
      });
    });
  }
}
