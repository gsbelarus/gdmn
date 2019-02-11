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
import {Constants} from "../../Constants";
import {ADatabase, DBStatus, IDBDetail} from "./ADatabase";
import {Session, SessionStatus} from "./Session";
import {SessionManager} from "./SessionManager";
import {ICmd, Level, Task} from "./task/Task";
import {ApplicationProcess} from "./worker/ApplicationProcess";
import {ApplicationProcessPool} from "./worker/ApplicationProcessPool";

export type AppAction =
  "PING"
  | "INTERRUPT"
  | "RELOAD_SCHEMA"
  | "GET_SCHEMA"
  | "QUERY"
  | "MAKE_QUERY"
  | "FETCH_QUERY";

export type AppCmd<A extends AppAction, P = undefined> = ICmd<A, P>;

export type PingCmd = AppCmd<"PING", { steps: number; delay: number; testChildProcesses?: boolean }>;
export type InterruptCmd = AppCmd<"INTERRUPT", { taskKey: string }>;
export type ReloadSchemaCmd = AppCmd<"RELOAD_SCHEMA", { withAdapter?: boolean }>;
export type GetSchemaCmd = AppCmd<"GET_SCHEMA", { withAdapter?: boolean }>;
export type QueryCmd = AppCmd<"QUERY", IEntityQueryInspector>;
export type MakeQueryCmd = AppCmd<"MAKE_QUERY", { query: IEntityQueryInspector }>;
export type FetchQueryCmd = AppCmd<"FETCH_QUERY", { taskKey: string, rowsCount: number }>;

export class Application extends ADatabase {

  public sessionLogger = log4js.getLogger("Session");
  public taskLogger = log4js.getLogger("Task");

  public readonly sessionManager = new SessionManager(this.sessionLogger);
  public readonly processPool = new ApplicationProcessPool();

  public erModel: ERModel = new ERModel();

  constructor(dbDetail: IDBDetail) {
    super(dbDetail);
  }

  private static async _reloadProcessERModel(worker: ApplicationProcess, withAdapter?: boolean): Promise<ERModel> {
    const reloadSchemaCmd: ReloadSchemaCmd = {
      id: "RELOAD_SCHEMA_ID",
      action: "RELOAD_SCHEMA",
      payload: {withAdapter}
    };
    const result: IERModel = await worker.executeCmd(Number.NaN, reloadSchemaCmd);
    return deserializeERModel(result, withAdapter);
  }

  private static async _getProcessERModel(worker: ApplicationProcess, withAdapter?: boolean): Promise<ERModel> {
    const getSchemaCmd: GetSchemaCmd = {
      id: "GET_SCHEMA_ID",
      action: "GET_SCHEMA",
      payload: {withAdapter}
    };
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

        if (!ApplicationProcess.isProcess && testChildProcesses) {
          await ApplicationProcessPool.executeWorker({
            pool: this.processPool,
            callback: (worker) => worker.executeCmd(session.userKey, context.command)
          });
        } else {
          context.progress.reset({max: steps}, false);
          context.progress.increment(0, `Process ping...`);
          for (let i = 0; i < steps; i++) {
            if (delay > 0) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
            context.progress.increment(1, `Process ping... Complete step: ${i + 1}`);
            await context.checkStatus();
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

  public pushInterruptCmd(session: Session, command: InterruptCmd): Task<InterruptCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(session);

        const {taskKey} = context.command.payload;

        const findTask = context.session.taskManager.find(taskKey);
        if (!findTask) {
          throw new Error("Task is not found");
        }
        if (findTask.options.session !== context.session) {
          throw new Error("No permissions");
        }
        findTask.interrupt();
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

        const {withAdapter} = context.command.payload;

        return this.erModel.serialize(withAdapter);
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
        await this.waitUnlock();
        this.checkSession(session);

        const {withAdapter} = context.command.payload;

        await this._lock.acquire();
        try {
          if (!ApplicationProcess.isProcess) {
            this.erModel = await ApplicationProcessPool.executeWorker({
              pool: this.processPool,
              callback: (worker) => Application._reloadProcessERModel(worker, true)
            });
          } else {
            this.erModel = await this._readERModel();
          }
          return this.erModel.serialize(withAdapter);
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

        const result = await this.executeSessionConnection(session, async (connection) => {
          const query = EntityQuery.inspectorToObject(this.erModel, context.command.payload);
          return await ERBridge.query(connection, connection.readTransaction, query);
        });
        await context.checkStatus();
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushMakeQueryCmd(session: Session, command: MakeQueryCmd): Task<MakeQueryCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(session);

        const {query} = context.command.payload;

        const entityQuery = EntityQuery.inspectorToObject(this.erModel, query);
        await this.executeSessionConnection(session, async (connection) => {
          const cursor = await ERBridge.openQueryCursor(connection, connection.readTransaction, entityQuery);
          try {
            session.cursors.set(task.id, cursor);

            await new Promise((resolve) => {
              let isResolve = false;
              cursor.waitClose().then(() => {
                if (!isResolve) {
                  isResolve = true;
                  resolve();
                }
              });
              task.emitter.on("change", (t) => {
                if (!isResolve && Task.DONE_STATUSES.includes(t.status)) {
                  isResolve = true;
                  resolve();
                }
              });
            });

            session.cursors.delete(task.id);
            await context.checkStatus();

          } finally {
            if (cursor.closed) {
              await cursor.close();
            }
          }
        });
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushFetchQueryCmd(
    session: Session,
    command: FetchQueryCmd
  ): Task<FetchQueryCmd, IEntityQueryResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(session);

        const {taskKey, rowsCount} = context.command.payload;

        const cursor = session.cursors.get(taskKey);
        if (!cursor) {
          throw new Error("Unknown taskKey");
        }

        const result = await cursor.fetch(rowsCount);
        if (result.finished) {
          await cursor.close();
        }
        return cursor.makeEntityQueryResponse(result.data);
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
    // TODO
    await session.lockConnection();
    try {
      return await this.executeConnection(callback);
    } finally {
      session.unlockConnection();
    }
  }

  protected async _onCreate(): Promise<void> {
    await super._onCreate();

    if (!ApplicationProcess.isProcess) {
      await this.processPool.create(this.dbDetail, {
        min: Constants.SERVER.APP_PROCESS.POOL.MIN,
        max: Constants.SERVER.APP_PROCESS.POOL.MAX,
        acquireTimeoutMillis: Constants.SERVER.APP_PROCESS.POOL.ACQUIRE_TIMEOUT,
        idleTimeoutMillis: Constants.SERVER.APP_PROCESS.POOL.IDLE_TIMEOUT
      });
      this.erModel = await ApplicationProcessPool.executeWorker({
        pool: this.processPool,
        callback: (worker) => Application._getProcessERModel(worker, true)
      });
    } else {
      this.erModel = await this._readERModel();
    }
  }

  protected async _onDelete(): Promise<void> {
    await super._onDelete();

    if (!ApplicationProcess.isProcess) {
      await this.processPool.destroy();
    }

    const {alias, connectionOptions}: IDBDetail = this.dbDetail;

    await this.sessionManager.forceCloseAll();
    this._logger.info("alias#%s (%s) closed all sessions", alias, connectionOptions.path);
  }

  protected async _onConnect(): Promise<void> {
    await super._onConnect();

    if (!ApplicationProcess.isProcess) {
      await this.processPool.create(this.dbDetail, {
        min: Constants.SERVER.APP_PROCESS.POOL.MIN,
        max: Constants.SERVER.APP_PROCESS.POOL.MAX,
        acquireTimeoutMillis: Constants.SERVER.APP_PROCESS.POOL.ACQUIRE_TIMEOUT,
        idleTimeoutMillis: Constants.SERVER.APP_PROCESS.POOL.IDLE_TIMEOUT
      });
      this.erModel = await ApplicationProcessPool.executeWorker({
        pool: this.processPool,
        callback: (worker) => Application._getProcessERModel(worker, true)
      });
    } else {
      this.erModel = await this._readERModel();
    }
  }

  protected async _onDisconnect(): Promise<void> {
    await super._onDisconnect();

    if (!ApplicationProcess.isProcess) {
      await this.processPool.destroy();
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
