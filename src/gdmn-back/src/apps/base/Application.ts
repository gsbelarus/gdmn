import {AConnection, TExecutor} from "gdmn-db";
import {ERBridge} from "gdmn-er-bridge";
import {
  deserializeERModel,
  EntityQuery,
  ERModel,
  IEntityQueryInspector,
  IEntityQueryResponse,
  IERModel
} from "gdmn-orm";
import log4js from "log4js";
import {ADatabase, DBStatus, IDBDetail} from "./ADatabase";
import {Session, SessionStatus} from "./Session";
import {SessionManager} from "./SessionManager";
import {ICmd, Level, Task} from "./task/Task";
import {ApplicationWorker} from "./worker/ApplicationWorker";
import {ApplicationWorkerPool} from "./worker/ApplicationWorkerPool";

export type AppAction = "PING" | "GET_SCHEMA" | "QUERY";

export type AppCmd<A extends AppAction, P = undefined> = ICmd<A, P>;

export type PingCmd = AppCmd<"PING", { steps: number; delay: number; }>;
export type GetSchemaCmd = AppCmd<"GET_SCHEMA", boolean>;
export type QueryCmd = AppCmd<"QUERY", IEntityQueryInspector>;

export class Application extends ADatabase {

  public sessionLogger = log4js.getLogger("Session");
  public taskLogger = log4js.getLogger("Task");

  public readonly sessionManager = new SessionManager(this.sessionLogger);
  public readonly workerPool = new ApplicationWorkerPool();

  public erModel: ERModel = new ERModel();

  constructor(dbDetail: IDBDetail) {
    super(dbDetail);
  }

  public pushPingCmd(session: Session, command: PingCmd): Task<PingCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(session);

        const {steps, delay} = context.command.payload;

        const stepPercent = 100 / steps;
        context.progress.increment(0, `Process ping...`);
        for (let i = 0; i < steps; i++) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          context.progress.increment(stepPercent, `Process ping... Complete step: ${i + 1}`);
          await context.checkStatus();
        }

        await this.waitUnlock();
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
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(session);

        return this.erModel.serialize(context.command.payload);
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
        await this.waitUnlock();
        this.checkSession(session);

        const result = await this.executeSessionConnection(session,
          (connection) => ERBridge.executeSelf({
            connection,
            transaction: connection.readTransaction,
            callback: (erBridge) => erBridge.query(EntityQuery.inspectorToObject(this.erModel, context.command.payload))
          })
        );
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
    if (!this.sessionManager.includes(session)) {
      this._logger.warn("Session id#%s does not belong to the application", session.id);
      throw new Error("Session does not belong to the application");
    }
  }

  public async reload(): Promise<void> {
    await this._lock.acquire();
    try {
      await this._load();
    } finally {
      this._lock.release();
    }
  }

  protected async executeSessionConnection<R>(session: Session, callback: TExecutor<AConnection, R>): Promise<R> {
    await session.lockConnection();
    try {
      return await this.executeConnection(callback);
    } finally {
      session.unlockConnection();
    }
  }

  protected async _onCreate(): Promise<void> {
    await super._onCreate();

    if (!ApplicationWorker.processIsWorker) {
      await this.workerPool.create(this.dbDetail, { // TODO move to config
        max: 1,
        acquireTimeoutMillis: 60000,
        idleTimeoutMillis: 60000
      });
    }
    await this._load();
  }

  protected async _onDelete(): Promise<void> {
    await super._onDelete();

    if (!ApplicationWorker.processIsWorker) {
      await this.workerPool.destroy();
    }

    const {alias, connectionOptions}: IDBDetail = this.dbDetail;

    await this.sessionManager.forceCloseAll();
    this._logger.info("alias#%s (%s) closed all sessions", alias, connectionOptions.path);
  }

  protected async _onConnect(): Promise<void> {
    await super._onConnect();

    if (!ApplicationWorker.processIsWorker) {
      await this.workerPool.create(this.dbDetail, { // TODO move to config
        max: 1,
        acquireTimeoutMillis: 60000,
        idleTimeoutMillis: 60000
      });
    }
    await this._load();
  }

  protected async _onDisconnect(): Promise<void> {
    await super._onDisconnect();

    if (!ApplicationWorker.processIsWorker) {
      await this.workerPool.destroy();
    }

    const {alias, connectionOptions}: IDBDetail = this.dbDetail;

    await this.sessionManager.forceCloseAll();
    this._logger.info("alias#%s (%s) closed all sessions", alias, connectionOptions.path);
  }

  private async _load(): Promise<void> {
    if (ApplicationWorker.processIsWorker) {
      await this._executeConnection(async (connection) => {
        await ERBridge.initDatabase(connection);
        await ERBridge.reloadERModel(connection, connection.readTransaction, this.erModel);
      });
    } else {
      this.erModel = await ApplicationWorkerPool.executeWorker({
        pool: this.workerPool,
        callback: async (worker) => {
          const getSchemaCmd: GetSchemaCmd = {id: "id", action: "GET_SCHEMA", payload: true};
          const result: IERModel = await worker.executeCmd(Number.NaN, getSchemaCmd);
          return deserializeERModel(result, true);
        }
      });
    }
  }
}
