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

export type AppAction = "PING" | "RELOAD_SCHEMA" | "GET_SCHEMA" | "QUERY";

export type AppCmd<A extends AppAction, P = undefined> = ICmd<A, P>;

export type PingCmd = AppCmd<"PING", { steps: number; delay: number; testChildProcesses?: boolean }>;
export type ReloadSchemaCmd = AppCmd<"RELOAD_SCHEMA", boolean>;
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

  private static async _reloadWorkerERModel(worker: ApplicationWorker, withAdapter?: boolean): Promise<ERModel> {
    const reloadSchemaCmd: ReloadSchemaCmd = {id: "RELOAD_SCHEMA_ID", action: "RELOAD_SCHEMA", payload: true};
    const result: IERModel = await worker.executeCmd(Number.NaN, reloadSchemaCmd);
    return deserializeERModel(result, withAdapter);
  }

  private static async _getWorkerERModel(worker: ApplicationWorker, withAdapter?: boolean): Promise<ERModel> {
    const getSchemaCmd: GetSchemaCmd = {id: "GET_SCHEMA_ID", action: "GET_SCHEMA", payload: true};
    const result: IERModel = await worker.executeCmd(Number.NaN, getSchemaCmd);
    return deserializeERModel(result, withAdapter);
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

        const {steps, delay, testChildProcesses} = context.command.payload;

        if (!ApplicationWorker.processIsWorker && testChildProcesses) {
          await ApplicationWorkerPool.executeWorker({
            pool: this.workerPool,
            callback: (worker) => worker.executeCmd(session.userKey, context.command)
          });
        } else {
          const stepPercent = 100 / steps;
          context.progress.increment(0, `Process ping...`);
          for (let i = 0; i < steps; i++) {
            if (delay > 0) {
              await new Promise((resolve) => setTimeout(resolve, delay));
              await context.checkStatus();
            }
            context.progress.increment(stepPercent, `Process ping... Complete step: ${i + 1}`);
          }
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

  public pushReloadSchemaCmd(session: Session, command: ReloadSchemaCmd): Task<ReloadSchemaCmd, IERModel> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this._lock.acquire();
        try {
          if (!ApplicationWorker.processIsWorker) {
            this.erModel = await ApplicationWorkerPool.executeWorker({
              pool: this.workerPool,
              callback: (worker) => Application._reloadWorkerERModel(worker, true)
            });
          } else {
            this.erModel = await this._readERModel();
          }
          return this.erModel.serialize(context.command.payload);
        } finally {
          this._lock.release();
        }
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
      this.erModel = await ApplicationWorkerPool.executeWorker({
        pool: this.workerPool,
        callback: (worker) => Application._getWorkerERModel(worker, true)
      });
    } else {
      this.erModel = await this._readERModel();
    }
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
      this.erModel = await ApplicationWorkerPool.executeWorker({
        pool: this.workerPool,
        callback: (worker) => Application._getWorkerERModel(worker, true)
      });
    } else {
      this.erModel = await this._readERModel();
    }
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

  private async _readERModel(): Promise<ERModel> {
    return await this._executeConnection(async (connection) => {
      await ERBridge.initDatabase(connection);
      return await ERBridge.reloadERModel(connection, connection.readTransaction, new ERModel());
    });
  }
}
