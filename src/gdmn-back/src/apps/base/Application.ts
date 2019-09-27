import {EventEmitter} from "events";
import {AConnection, IParams} from "gdmn-db";
import {EQueryCursor, ERBridge, ISqlPrepareResponse, ISqlQueryResponse, SqlQueryCursor} from "gdmn-er-bridge";
import {
  deserializeERModel,
  Entity,
  EntityDelete,
  EntityInsert,
  EntityQuery,
  EntityQuerySet,
  EntityUpdate,
  EntityUtils,
  ERModel,
  IAttribute,
  IEntityDeleteInspector,
  IEntityInsertInspector,
  IEntityQueryInspector,
  IEntityQueryResponse,
  IEntityQuerySetInspector,
  IEntityQuerySetResponse,
  IEntityUpdateInspector,
  IERModel,
  ISequenceQueryInspector,
  ISequenceQueryResponse,
  SequenceQuery
} from "gdmn-orm";
import log4js from "log4js";
import {Constants} from "../../Constants";
import {ADatabase, DBStatus, IDBDetail} from "./ADatabase";
import {ISessionInfo, ITask, Session, SessionStatus} from "./session/Session";
import {SessionManager} from "./session/SessionManager";
import {ICmd, Level, Task, TaskStatus} from "./task/Task";
import {ApplicationProcess} from "./worker/ApplicationProcess";
import {ApplicationProcessPool} from "./worker/ApplicationProcessPool";
import {ISettingData, ISettingParams, isISettingData} from "gdmn-internals";
import { promises } from "fs";

export type AppAction =
  "DEMO"
  | "PING"
  | "INTERRUPT"
  | "RELOAD_SCHEMA"
  | "GET_SCHEMA"
  | "DEFINE_ENTITY"
  | "QUERY"
  | "QUERY_SET"
  | "SQL_QUERY"
  | "PREPARE_QUERY"
  | "PREPARE_SQL_QUERY"
  | "SQL_PREPARE"
  | "FETCH_QUERY"
  | "FETCH_SQL_QUERY"
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "SEQUENCE_QUERY"
  | "GET_SESSIONS_INFO"
  | "GET_MAIN_SESSIONS_INFO"
  | "GET_NEXT_ID"
  | "ADD_ENTITY"
  | "DELETE_ENTITY"
  | "EDIT_ENTITY"
  | "QUERY_SETTING"
  | "SAVE_SETTING";

export type AppCmd<A extends AppAction, P = undefined> = ICmd<A, P>;

export type DemoCmd = AppCmd<"DEMO", { withError: boolean }>;
export type PingCmd = AppCmd<"PING", { steps: number; delay: number; testChildProcesses?: boolean }>;
export type InterruptCmd = AppCmd<"INTERRUPT", { taskKey: string }>;
export type ReloadSchemaCmd = AppCmd<"RELOAD_SCHEMA", { withAdapter?: boolean }>;
export type GetSchemaCmd = AppCmd<"GET_SCHEMA", { withAdapter?: boolean }>;
export type DefineEntityCmd = AppCmd<"DEFINE_ENTITY", { entity: string, pkValues: any[] }>;
export type QueryCmd = AppCmd<"QUERY", { query: IEntityQueryInspector }>;
export type QuerySetCmd = AppCmd<"QUERY_SET", { querySet: IEntityQuerySetInspector }>;
export type SqlQueryCmd = AppCmd<"SQL_QUERY", { select: string, params: IParams }>;
export type PrepareQueryCmd = AppCmd<"PREPARE_QUERY", { query: IEntityQueryInspector }>;
export type PrepareSqlQueryCmd = AppCmd<"PREPARE_SQL_QUERY", { select: string, params: IParams }>;
export type SqlPrepareCmd = AppCmd<"SQL_PREPARE", { sql: string }>;
export type FetchQueryCmd = AppCmd<"FETCH_QUERY", { taskKey: string, rowsCount: number }>;
export type FetchSqlQueryCmd = AppCmd<"FETCH_SQL_QUERY", { taskKey: string, rowsCount: number }>;
export type InsertCmd = AppCmd<"INSERT", { insert: IEntityInsertInspector }>;
export type UpdateCmd = AppCmd<"UPDATE", { update: IEntityUpdateInspector }>;
export type DeleteCmd = AppCmd<"DELETE", { delete: IEntityDeleteInspector }>;
export type SequenceQueryCmd = AppCmd<"SEQUENCE_QUERY", { query: ISequenceQueryInspector }>;
export type GetSessionsInfoCmd = AppCmd<"GET_SESSIONS_INFO", { withError: boolean }>;
export type GetNextIdCmd = AppCmd<"GET_NEXT_ID", { withError: boolean }>;
export type AddEntityCmd = AppCmd<"ADD_ENTITY", { entityName: string, parentName?: string, attributes?: IAttribute[] }>;
export type DeleteEntityCmd = AppCmd<"DELETE_ENTITY", { entityName: string }>;
export type EditEntityCmd = AppCmd<"EDIT_ENTITY", {
  entityName: string,
  parentName?: string,
  changedFields: { [fieldName: string]: string },
  attributes: IAttribute[];
}>;

export type QuerySettingCmd = AppCmd<"QUERY_SETTING", { query: ISettingParams[] }>;
export type SaveSettingCmd = AppCmd<"SAVE_SETTING", { oldData?: ISettingData, newData: ISettingData }>;

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

  private _getSettingFileName(type: string) {
    const pathFromDB = this.dbDetail.connectionOptions.path;
    return `${pathFromDB.substring(0, pathFromDB.lastIndexOf("\\"))}\\type.${type}.json`;    
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
                context.progress!.increment(1, `Process demo...`);
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

  public pushSessionsInfoCmd(session: Session, command: GetSessionsInfoCmd): Task<GetSessionsInfoCmd, ISessionInfo[]> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const sessionsInfo: ISessionInfo[] = [];
        this.sessionManager.sessions.map((ses) => {
          const taskInfo: ITask[] = [];
          for (const item of ses.taskManager.getAll().values()) {
            taskInfo.push({
              id: item.id,
              status: item.status,
              command: item.options.command
            });
          }
          if (taskInfo.length) {
            sessionsInfo.push({
              database: "",
              id: ses.options.id,
              user: ses.options.userKey,
              usesConnections: ses.usesConnections.map((conn) => conn.uses),
              tasks: taskInfo
            });
          }
          sessionsInfo.push({
            database: "",
            id: ses.options.id,
            user: ses.options.userKey,
            usesConnections: ses.usesConnections.map((conn) => conn.uses),
          });
        });
        return sessionsInfo;
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

  public pushDefineEntityCmd(session: Session, command: DefineEntityCmd): Task<DefineEntityCmd, { entity: string }> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {entity: entityName, pkValues} = context.command.payload;

        const entity = await context.session.executeConnection((connection) => (
          ERBridge.defineEntity(
            connection,
            connection.readTransaction,
            this.erModel,
            this.erModel.entity(entityName),
            pkValues
          )
        ));
        return {entity: entity.name};
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushAddEntityCmd(session: Session,
                          command: AddEntityCmd
  ): Task<AddEntityCmd, string[]> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);
        const {entityName, parentName, attributes} = context.command.payload;

        const getNewEntity = () => {
          if (parentName) {
            try {
              return new Entity({
                parent: this.erModel.entity(parentName),
                name: entityName,
                lName: {}
              });
            } catch (error) {
              throw error;
            }
          }
          return new Entity({
            name: entityName,
            lName: {}
          });
        };
        await context.session.executeConnection((connection) => AConnection.executeTransaction({
          connection,
          callback: (transaction) => ERBridge.executeSelf({
            connection,
            transaction,
            callback: async ({erBuilder, eBuilder}) => {
              const entity = await erBuilder.create(this.erModel, getNewEntity());
              if (attributes) {
                const lengthArr = attributes.length;
                for (let i = 0; i < lengthArr; i++) {
                  const attr = EntityUtils.createAttribute(attributes[i], entity, this.erModel);
                  await eBuilder.createAttribute(entity, attr);
                }
              }
            }
          })
        }));
        return this.erModel.entity(entityName).inspect();
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushDeleteEntityCmd(session: Session,
                             command: DeleteEntityCmd
  ): Task<DeleteEntityCmd, { entityName: string }> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {entityName} = context.command.payload;

        await context.session.executeConnection((connection) => AConnection.executeTransaction({
          connection,
          callback: (transaction) => ERBridge.executeSelf({
            connection,
            transaction,
            callback: async ({erBuilder}) => {
              await erBuilder.delete(this.erModel, this.erModel.entity(entityName));
            }
          })
        }));
        return {entityName};
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushEditEntityCmd(session: Session,
                           command: EditEntityCmd
  ): Task<EditEntityCmd, { entityName: string }> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {entityName, parentName, changedFields, attributes} = context.command.payload;
        await context.session.executeConnection((connection) => AConnection.executeTransaction({
          connection,
          callback: (transaction) => ERBridge.executeSelf({
            connection,
            transaction,
            callback: async ({erBuilder, eBuilder}) => {
              const entity = this.erModel.entity(entityName);
              const attr = entity.attributes;

              const chfields = Object.entries(changedFields);
              for await (const [key, value] of chfields) {
                const result = Object.keys(attr).map((attrKey) => {
                  return attrKey;
                });
                const findAttr = result.find((r) => r === key);

                if (findAttr && value === "delete") {
                  await erBuilder.eBuilder.deleteAttribute(
                    this.erModel.entity(entityName),
                    entity.attribute(key));
                } else {
                  const editAttr = attributes.find((at) => at.id === key);
                  if (editAttr) {
                    const newAttr = EntityUtils.createAttribute(editAttr, entity, this.erModel);
                    await eBuilder.createAttribute(entity, newAttr);
                  }
                }
              }
            }
          })
        }));
        return {entityName};
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

        return await this._executeWithLock(async () => {
          if (!ApplicationProcess.isProcess) {
            this.erModel = await ApplicationProcessPool.executeWorker({
              pool: this.processPool,
              callback: (worker) => Application._reloadProcessERModel(worker, true)
            });
          } else {
            this.erModel = await this._readERModel();
          }
          return this.erModel.serialize(withAdapter);
        });
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

  public pushQuerySetCmd(session: Session, command: QuerySetCmd): Task<QuerySetCmd, IEntityQuerySetResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);
        const {querySet} = context.command.payload;
        const entityQuerySet = EntityQuerySet.inspectorToObject(this.erModel, querySet);

        const result = await context.session.executeConnection((connection) => (
          ERBridge.querySet(connection, connection.readTransaction, entityQuerySet))
        );
        await context.checkStatus();
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushSqlQueryCmd(session: Session, command: SqlQueryCmd): Task<SqlQueryCmd, ISqlQueryResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {select, params} = context.command.payload;

        const result = await context.session.executeConnection((connection) => (
          ERBridge.sqlQuery(connection, connection.readTransaction, this.erModel, select, params))
        );
        await context.checkStatus();
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushPrepareQueryCmd(session: Session, command: PrepareQueryCmd): Task<PrepareQueryCmd, void> {
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
                cursor.waitForClosing().then(() => resolve()).catch(reject);
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

  public pushPrepareSqlQueryCmd(session: Session, command: PrepareSqlQueryCmd): Task<PrepareSqlQueryCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      unlimited: true,
      logger: this.taskLogger,
      worker: async (context) => {
        const {select, params} = context.command.payload;

        const cursorEmitter = new EventEmitter();
        const cursorPromise = new Promise<SqlQueryCursor>((resolve, reject) => {
          cursorEmitter.once("cursor", resolve);
          cursorEmitter.once("error", reject);
        });
        context.session.cursorsPromises.set(task.id, cursorPromise);
        try {
          await this.waitUnlock();
          this.checkSession(context.session);

          await context.session.executeConnection(async (connection) => {
            const cursor = await ERBridge.openSqlQueryCursor(connection, connection.readTransaction, this.erModel,
              select, params);
            try {
              cursorEmitter.emit("cursor", cursor);
              await new Promise((resolve, reject) => {
                // wait for closing cursor
                cursor.waitForClosing().then(() => resolve()).catch(reject);
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

  public pushSqlPrepareCmd(session: Session, command: SqlPrepareCmd): Task<SqlPrepareCmd, ISqlPrepareResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {sql} = context.command.payload;

        const result = await context.session.executeConnection((connection) =>
          ERBridge.sqlPrepare(connection, connection.readTransaction, sql)
        );
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushFetchQueryCmd(session: Session, command: FetchQueryCmd): Task<FetchQueryCmd, IEntityQueryResponse> {
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
        if (!cursor || !(cursor instanceof EQueryCursor)) {
          throw new Error("Cursor is not found");
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
        return cursor.makeEQueryResponse(result.data);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushFetchSqlQueryCmd(session: Session, command: FetchSqlQueryCmd): Task<FetchSqlQueryCmd, ISqlQueryResponse> {
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
        if (!cursor || !(cursor instanceof SqlQueryCursor)) {
          throw new Error("Cursor is not found");
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
        return cursor.makeSqlQueryResponse(result.data);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushInsertCmd(session: Session, command: InsertCmd): Task<InsertCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {insert} = context.command.payload;

        const entityInsert = EntityInsert.inspectorToObject(this.erModel, insert);

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

  public pushSequenceQueryCmd(session: Session,
                              command: SequenceQueryCmd): Task<SequenceQueryCmd, ISequenceQueryResponse> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {query} = context.command.payload;
        const sequenceQuery = SequenceQuery.inspectorToObject(this.erModel, query);

        const result = await context.session.executeConnection((connection) => (
          ERBridge.getSequence(connection, connection.readTransaction, sequenceQuery))
        );
        await context.checkStatus();
        return result;
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushGetNextIdCmd(session: Session,
                          command: GetNextIdCmd): Task<GetNextIdCmd, { id: number }> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);
        const nextId = await context.session.executeConnection(async (connection): Promise<number> => {
          const idResult = await connection.executeReturning(connection.readTransaction, `
          EXECUTE BLOCK
          RETURNS
           (ID INTEGER)
          AS
            DECLARE VARIABLE ATPID INTEGER;
          BEGIN
            ID = 0;
            SELECT ID
            FROM AT_PROCEDURES
            WHERE PROCEDURENAME = 'GD_P_GETNEXTID_EX'
            INTO ATPID;
            IF (NOT ATPID IS NULL) THEN
            BEGIN
              EXECUTE PROCEDURE GD_P_GETNEXTID_EX
              RETURNING_VALUES :ID;
            END
            ELSE
            BEGIN
              SELECT GEN_ID(gd_g_unique, 1) + GEN_ID(gd_g_offset, 0)
              FROM RDB$DATABASE INTO :ID;
            END
            SUSPEND;
          END
          `);
          return idResult.getNumber(0);
        });
        await context.checkStatus();
        return {id: nextId};
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  // TODO: пока обрабатываем только первый объект из массива, из запроса с клиента
  public pushQuerySettingCmd(session: Session,
                             command: QuerySettingCmd): Task<QuerySettingCmd, ISettingData[]> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);
        const payload = context.command.payload;
        const fileName = this._getSettingFileName(payload.query[0].type);
        
        let data = await promises.readFile(fileName, { encoding: 'utf8', flag: 'r' })
          .then( text => JSON.parse(text) )
          .then( arr => {
            if (Array.isArray(arr) && arr.length && isISettingData(arr[0])) {
              console.log(`Read data from file ${fileName}`);
              return arr as ISettingData[];
            } else {
              console.log(`Unknown data type in file ${fileName}`);
              return undefined;
            }
          })
          .catch( err => {
            console.log(`Error reading file ${fileName} - ${err}`);
            return undefined;
          });

        await context.checkStatus();

        return data ? data.filter( s => isISettingData(s) && s.type === payload.query[0].type && s.objectID === payload.query[0].objectID) as ISettingData[] : [];
      }
    });

    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushSaveSettingCmd(session: Session,
                            command: SaveSettingCmd): Task<SaveSettingCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);
        const { newData } = context.command.payload;
        //Получаем путь, где храниться база данных
        const pathFromDB = `${this.dbDetail.connectionOptions.path}`;
        //Путь, по которому необходимо сохранить новые настройки
        const pathForFileType =`${pathFromDB.substring(0, pathFromDB.lastIndexOf("\\"))}\\type.${newData.type}.json`;

        // читаем массив настроек из файла, если файла нет
        // или возникла ошибка, то пишем ее в лог и игнорируем
        // в этом случае data === undefined
        // минимально проверяем тип данных
        let data = await promises.readFile(pathForFileType, { encoding: 'utf8', flag: 'r' })
          .then( text => JSON.parse(text) )
          .then( arr => {
            if (Array.isArray(arr) && arr.length && isISettingData(arr[0])) {
              return arr as ISettingData[];
            } else {
              console.log('unknown data type');
              return undefined;
            }
          })
          .catch( err => {
            console.log(err);
            return undefined;
          });

        if (data) {
          const idx = data.findIndex( s => isISettingData(s) && s.type === newData.type && s.objectID === newData.objectID );
          if (idx === -1) {
            data.push(newData);
          } else {
            data[idx] = newData;
          }
        } else {
          data = [newData];
        }

        // записываем файл. если будет ошибка, то выведем ее в лог,
        // но не будем прерывать выполнение задачи
        try {
          await promises.writeFile(pathForFileType, JSON.stringify(data), { encoding: 'utf8', flag: 'w' });
        }
        catch (e) {
          console.log(e);
        }

        await context.checkStatus();
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
