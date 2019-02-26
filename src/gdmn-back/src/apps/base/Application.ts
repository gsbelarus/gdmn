import {EventEmitter} from "events";
import {AConnection} from "gdmn-db";
import {EQueryCursor, ERBridge} from "gdmn-er-bridge";
import {
  deserializeERModel,
  EntityDelete,
  EntityInsert,
  EntityQuery,
  EntityUpdate,
  ERModel,
  IEntityDeleteInspector,
  IEntityInsertInspector,
  IEntityQueryInspector,
  IEntityQueryResponse,
  IEntityUpdateInspector,
  IERModel
} from "gdmn-orm";
import log4js from "log4js";
import {Constants} from "../../Constants";
import {ADatabase, DBStatus, IDBDetail} from "./ADatabase";
import {Session, SessionStatus} from "./session/Session";
import {SessionManager} from "./session/SessionManager";
import {ICmd, Level, Task, TaskStatus} from "./task/Task";
import {ApplicationProcess} from "./worker/ApplicationProcess";
import {ApplicationProcessPool} from "./worker/ApplicationProcessPool";

export type AppAction =
  "DEMO"
  | "PING"
  | "INTERRUPT"
  | "RELOAD_SCHEMA"
  | "GET_SCHEMA"
  | "QUERY"
  | "PREPARE_QUERY"
  | "FETCH_QUERY"
  | "CREATE"
  | "UPDATE"
  | "DELETE";

export type AppCmd<A extends AppAction, P = undefined> = ICmd<A, P>;

export type DemoCmd = AppCmd<"DEMO", { withError: boolean }>;
export type PingCmd = AppCmd<"PING", { steps: number; delay: number; testChildProcesses?: boolean }>;
export type InterruptCmd = AppCmd<"INTERRUPT", { taskKey: string }>;
export type ReloadSchemaCmd = AppCmd<"RELOAD_SCHEMA", { withAdapter?: boolean }>;
export type GetSchemaCmd = AppCmd<"GET_SCHEMA", { withAdapter?: boolean }>;
export type QueryCmd = AppCmd<"QUERY", { query: IEntityQueryInspector, sequentially?: boolean }>;
export type PrepareQueryCmd = AppCmd<"PREPARE_QUERY", { query: IEntityQueryInspector }>;
export type FetchQueryCmd = AppCmd<"FETCH_QUERY", { taskKey: string, rowsCount: number }>;
export type CreateCmd = AppCmd<"CREATE", { create: IEntityInsertInspector }>;
export type UpdateCmd = AppCmd<"UPDATE", { update: IEntityUpdateInspector }>;
export type DeleteCmd = AppCmd<"DELETE", { delete: IEntityDeleteInspector }>;

export class Application extends ADatabase {

  public sessionLogger = log4js.getLogger("Session");
  public taskLogger = log4js.getLogger("Task");

  public readonly sessionManager = new SessionManager(this.connectionPool, this.sessionLogger);
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

  public pushDemoCmd(session: Session, command: DemoCmd): Task<DemoCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      progress: {enabled: true},
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {withError} = context.command.payload;

        await context.session.executeConnection(async (connection) => {
          const contactCountResult = await connection.executeReturning(connection.readTransaction, `
            SELECT COUNT(*)
            FROM GD_CONTACT
          `);
          const contactCount = contactCountResult.getNumber(0);

          await context.checkStatus();

          context.progress!.reset({max: contactCount}, false);
          context.progress!.increment(0, `Process demo... Fetch contacts`);

          await AConnection.executeQueryResultSet({
            connection,
            transaction: connection.readTransaction,
            sql: `
              SELECT
                ID,
                NAME
              FROM GD_CONTACT
            `,
            callback: async (resultSet) => {
              const indexError = Math.floor(Math.random() * 150) + 50;
              let i = 0;
              while (await resultSet.next()) {
                if (withError && i === indexError) {
                  throw new Error("Demo error");
                }
                const id = resultSet.getNumber("ID");
                const name = resultSet.getString("NAME");
                const entryCountResult = await connection.executeReturning(connection.readTransaction, `
                  SELECT COUNT(*)
                  FROM AC_ENTRY
                  WHERE USR$GS_CUSTOMER = :contactKey
                `, {contactKey: id});
                const entryCount = entryCountResult.getNumber(0);

                await context.checkStatus();
                context.progress!.increment(1, `Process demo... ${name}:${entryCount}`);
                i++;
              }
            }
          });
        });
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
      level: Level.SESSION,
      progress: {enabled: true},
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {steps, delay, testChildProcesses} = context.command.payload;

        if (!ApplicationProcess.isProcess && testChildProcesses) {
          await ApplicationProcessPool.executeWorker({
            pool: this.processPool,
            callback: (worker) => worker.executeCmd(context.session.userKey, context.command)
          });
        } else {
          for (let i = 0; i < steps; i++) {
            if (i === 0) {
              context.progress!.reset({max: steps}, false);
              context.progress!.increment(0, `Process ping...`);
            }
            if (delay > 0) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
            context.progress!.increment(1, `Process ping... Complete step: ${i + 1}`);
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
        this.checkSession(context.session);

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
        this.checkSession(context.session);

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
        this.checkSession(context.session);

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

  public pushQueryCmd(session: Session,
                      command: QueryCmd
  ): Task<QueryCmd, IEntityQueryResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      unlimited: true,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {query} = context.command.payload;
        const entityQuery = EntityQuery.inspectorToObject(this.erModel, query);

        const result = await context.session.executeConnection((connection) => (
          ERBridge.query(connection, connection.readTransaction, entityQuery))
        );
        await context.checkStatus();
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushPrepareQueryCmd(session: Session,
                             command: PrepareQueryCmd
  ): Task<PrepareQueryCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      unlimited: true,
      logger: this.taskLogger,
      worker: async (context) => {
        const {query} = context.command.payload;
        const entityQuery = EntityQuery.inspectorToObject(this.erModel, query);

        const cursorEmitter = new EventEmitter();
        const cursorPromise = new Promise<EQueryCursor>((resolve, reject) => {
          cursorEmitter.once("cursor", resolve);
          cursorEmitter.once("error", reject);
        });
        context.session.cursorsPromises.set(task.id, cursorPromise);
        try {
          await this.waitUnlock();
          this.checkSession(context.session);

          await context.session.executeConnection(async (connection) => {
            const cursor = await ERBridge.openQueryCursor(connection, connection.readTransaction, entityQuery);
            try {
              cursorEmitter.emit("cursor", cursor);
              await new Promise((resolve, reject) => {
                // wait for closing cursor
                cursor.waitClose().then(() => resolve()).catch(reject);
                // or wait for interrupt task
                task.emitter.on("change", (t) => t.status === TaskStatus.INTERRUPTED ? resolve() : undefined);
              });
            } finally {
              if (!cursor.closed) {
                await cursor.close();
              }
            }
          });
        } catch (error) {
          cursorEmitter.emit("error", error);
        } finally {
          context.session.cursorsPromises.delete(task.id);
        }
        await context.checkStatus();
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushFetchQueryCmd(session: Session,
                           command: FetchQueryCmd
  ): Task<FetchQueryCmd, IEntityQueryResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {taskKey, rowsCount} = context.command.payload;

        const cursor = await context.session.cursorsPromises.get(taskKey);
        if (!cursor) {
          throw new Error("Unknown taskKey");
        }

        const result = await cursor.fetch(rowsCount);
        if (result.finished && !cursor.closed) {
          await cursor.close();
          // wait for finish query task
          const findTask = context.session.taskManager.find(taskKey);
          if (findTask) {
            await findTask.waitDoneStatus();
          }
        }
        return cursor.makeEntityQueryResponse(result.data);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushCreateCmd(session: Session, command: CreateCmd): Task<CreateCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {create} = context.command.payload;

        const entityInsert = EntityInsert.inspectorToObject(this.erModel, create);

        await context.session.executeConnection((connection) => AConnection.executeTransaction({
          connection,
          callback: (transaction) => ERBridge.insert(connection, transaction, entityInsert)
        }));
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushUpdateCmd(session: Session, command: UpdateCmd): Task<UpdateCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {update} = context.command.payload;

        const entityUpdate = EntityUpdate.inspectorToObject(this.erModel, update);

        await context.session.executeConnection((connection) => AConnection.executeTransaction({
          connection,
          callback: (transaction) => ERBridge.update(connection, transaction, entityUpdate)
        }));
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushDeleteCmd(session: Session, command: DeleteCmd): Task<DeleteCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {delete: delete1} = context.command.payload;

        const entityDelete = EntityDelete.inspectorToObject(this.erModel, delete1);

        await context.session.executeConnection((connection) => AConnection.executeTransaction({
          connection,
          callback: (transaction) => ERBridge.delete(connection, transaction, entityDelete)
        }));
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
    await this._executeConnection(async (connection) => ERBridge.initDatabase(connection));
    return await ERBridge.reloadERModel(this.connectionPool, new ERModel());
  }
}
