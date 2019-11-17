import {EventEmitter} from "events";
import {AConnection, IParams, INamedParams} from "gdmn-db";
import {EQueryCursor, ERBridge, ISqlQueryResponse, SqlQueryCursor} from "gdmn-er-bridge";
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
  SequenceQuery,
  IEntity,
  IEntityInsertFieldInspector
} from "gdmn-orm";
import log4js from "log4js";
import {Constants} from "../../Constants";
import {ADatabase, DBStatus, IDBDetail} from "./ADatabase";
import {ISessionInfo, ITask, Session, SessionStatus} from "./session/Session";
import {SessionManager} from "./session/SessionManager";
import {ICmd, Level, Task, TaskStatus} from "./task/Task";
import {ApplicationProcess} from "./worker/ApplicationProcess";
import {ApplicationProcessPool} from "./worker/ApplicationProcessPool";
import {ISettingParams, ISettingEnvelope, ISqlPrepareResponse, detectAndParseDate} from "gdmn-internals";
import {str2SemCategories} from "gdmn-nlp";
import path from "path";
import { SettingsCache } from "./SettingsCache";
import { settingsCacheManager } from "./SettingsCacheManager";

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
  | "DELETE_ATTRIBUTE"
  | "QUERY_SETTING"
  | "SAVE_SETTING"
  | "DELETE_SETTING";

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
export type AddEntityCmd = AppCmd<"ADD_ENTITY", IEntity>;
export type DeleteEntityCmd = AppCmd<"DELETE_ENTITY", { entityName: string }>;
export type DeleteAttributeCmd = AppCmd<"DELETE_ATTRIBUTE", { entityData: IEntity, attrName: string }>;
export type QuerySettingCmd = AppCmd<"QUERY_SETTING", { query: ISettingParams[] }>;
export type SaveSettingCmd = AppCmd<"SAVE_SETTING", { newData: ISettingEnvelope }>;
export type DeleteSettingCmd = AppCmd<"DELETE_SETTING", { data: ISettingParams }>;

export class Application extends ADatabase {

  public sessionLogger = log4js.getLogger("Session");
  public taskLogger = log4js.getLogger("Task");

  public readonly sessionManager = new SessionManager(this.connectionPool, this.sessionLogger);
  public readonly processPool = new ApplicationProcessPool();

  public erModel: ERModel = new ERModel();

  public settingsCache: SettingsCache;

  constructor(dbDetail: IDBDetail) {
    super(dbDetail);

    const dbFullPath = dbDetail.connectionOptions.path;
    this.settingsCache = settingsCacheManager.add
      (dbFullPath, dbFullPath.slice(0, dbFullPath.length - path.parse(dbFullPath).ext.length));
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

  /** Добавление новой сущности */
  public pushAddEntityCmd(session: Session,
                          command: AddEntityCmd
  ): Task<AddEntityCmd, IEntity> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);
        const {name, parent, attributes, lName, isAbstract, adapter, semCategories, unique} = context.command.payload;

        const preEntity = new Entity({
          parent: parent ? this.erModel.entity(parent) : undefined,
          name,
          lName,
          adapter,
          isAbstract,
          unique,
          semCategories: semCategories ? str2SemCategories(semCategories) : undefined
        });

        if (attributes) {
          attributes.map(attr => EntityUtils.createAttribute(attr, this.erModel)).map(attr => preEntity.add(attr));
        }

        await context.session.executeConnection((connection) => AConnection.executeTransaction({
          connection,
          callback: (transaction) => ERBridge.executeSelf({
            connection,
            transaction,
            callback: async ({erBuilder, eBuilder}) => {
              await erBuilder.create(this.erModel, preEntity);
            }
          })
        }));
        return this.erModel.entity(name).serialize(true);
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  /** Удаление сущности */
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

  /** Удаление атрибута */
  public pushDeleteAttributeCmd(session: Session,
                                command: DeleteAttributeCmd
  ): Task<DeleteAttributeCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);

        const {entityData, attrName} = context.command.payload;
        await context.session.executeConnection((connection) => AConnection.executeTransaction({
          connection,
          callback: (transaction) => ERBridge.executeSelf({
            connection,
            transaction,
            callback: async ({erBuilder, eBuilder}) => {
              const entity = this.erModel.entity(entityData.name);
              const attribute = entity.attribute(attrName);
              await erBuilder.eBuilder.deleteAttribute(entity, attribute);
            }
          })
        }));
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
        const {select, params: preParams} = context.command.payload;

        const params = this.isNamedParams(preParams) ?
          Object.keys(preParams).reduce((map, obj: keyof INamedParams) => {
            map[obj] = detectAndParseDate((preParams as INamedParams)[obj]);
            return map;
          }, {} as INamedParams)
        : preParams;

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

  /** Преобразовываем значения полей типа Дата из строки в дату */
  public parseDate = (entityname: string, fields: IEntityInsertFieldInspector[]): IEntityInsertFieldInspector[] => {
    const entity = this.erModel.entity(entityname);
    return fields.map(f => {
      const attribute = entity.attribute(f.attribute);
      return f.value !== null && typeof f.value === "string" && (attribute.type === "TimeStamp" || attribute.type === "Date" || attribute.type === "Time")
        ? {...f, value: new Date(f.value)}
        : f;
     });
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

        const {insert: {entity, fields: prefields}} = context.command.payload;

        const fields = this.parseDate(entity, prefields);

        const entityInsert = EntityInsert.inspectorToObject(this.erModel, {entity, fields});

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

        const {update: {entity, fields: prefields, pkValues}} = context.command.payload;

        const fields = this.parseDate(entity, prefields);

        const entityUpdate = EntityUpdate.inspectorToObject(this.erModel,  {entity, fields, pkValues});

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
                             command: QuerySettingCmd): Task<QuerySettingCmd, ISettingEnvelope[]> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);
        const payload = context.command.payload;
        const data = await this.settingsCache.querySetting(payload.query[0].type, payload.query[0].objectID);
        await context.checkStatus();
        return data;
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
        this.settingsCache.writeSetting(newData);
        await context.checkStatus();
      }
    });
    session.taskManager.add(task);
    this.sessionManager.syncTasks();
    return task;
  }

  public pushDeleteSettingCmd(session: Session, command: DeleteSettingCmd): Task<DeleteSettingCmd, void> {
    const task = new Task({
      session,
      command,
      level: Level.SESSION,
      logger: this.taskLogger,
      worker: async (context) => {
        await this.waitUnlock();
        this.checkSession(context.session);
        const payload = context.command.payload;
        this.settingsCache.deleteSetting(payload.data);
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
    await this.settingsCache.flush(true);
    await super._onDisconnect();
    if (!ApplicationProcess.isProcess) {
      await this.processPool.destroy();
    }

    const {alias, connectionOptions}: IDBDetail = this.dbDetail;

    await this.sessionManager.forceCloseAll();
    this._logger.info("alias#%s (%s) closed all sessions", alias, connectionOptions.path);
  }

  private isNamedParams(s: any): s is INamedParams {
    return s instanceof Object && !Array.isArray(s);
  }

  private async _readERModel(): Promise<ERModel> {
    await this._executeConnection(async (connection) => ERBridge.initDatabase(connection));
    return await ERBridge.reloadERModel(this.connectionPool, new ERModel());
  }
}
