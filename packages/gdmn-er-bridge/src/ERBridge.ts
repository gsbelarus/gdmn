import {AccessMode, AConnection, AConnectionPool, ATransaction, Factory, IBaseExecuteOptions, IParams} from "gdmn-db";
import {Entity, EntityDelete, EntityInsert, EntityQuery, EntityUpdate, ERModel, IEntityQueryResponse, SequenceQuery, ISequenceQueryResponse} from "gdmn-orm";
import {Delete} from "./crud/delete/Delete";
import {Insert} from "./crud/insert/Insert";
import {Update} from "./crud/update/Update";
import {EQueryCursor} from "./cursor/EQueryCursor";
import {ISqlQueryResponse, SqlQueryCursor} from "./cursor/SqlQueryCursor";
import {EntityBuilder} from "./ddl/builder/EntityBuilder";
import {ERModelBuilder} from "./ddl/builder/ERModelBuilder";
import {DDLHelper} from "./ddl/DDLHelper";
import {ERExport} from "./ddl/export/ERExport";
import {DBSchemaUpdater} from "./ddl/updates/DBSchemaUpdater";
import {EntityDefiner} from "./EntityDefiner";
import {GetSequence } from "./crud/query/Sequence";

export interface IExecuteERBridgeOptions<R> extends IBaseExecuteOptions<ERBridge, R> {
  connection: AConnection;
  transaction: ATransaction;
}

export class ERBridge {

  public readonly ddlHelper: DDLHelper;
  public readonly erBuilder: ERModelBuilder;

  constructor(connection: AConnection, transaction: ATransaction) {
    this.ddlHelper = new DDLHelper(connection, transaction);
    this.erBuilder = new ERModelBuilder(this.ddlHelper);
  }

  get connection(): AConnection {
    return this.ddlHelper.connection;
  }

  get transaction(): ATransaction {
    return this.ddlHelper.transaction;
  }

  get eBuilder(): EntityBuilder {
    return this.erBuilder.eBuilder;
  }

  get disposed(): boolean {
    return this.ddlHelper.disposed;
  }

  public static async executeSelf<R>(
    {connection, transaction, callback}: IExecuteERBridgeOptions<R>
  ): Promise<R> {
    const erBridge = new ERBridge(connection, transaction);
    try {
      return await callback(erBridge);
    } finally {
      const logs = erBridge.ddlHelper.logs.join("\n");
      if (logs) {
        console.debug(logs);
      }
      if (!erBridge.disposed) {
        await erBridge.dispose();
      }
    }
  }

  public static async initDatabase(connection: AConnection): Promise<void> {
    await new DBSchemaUpdater(connection).run();
  }

  public static async reloadERModel(connectionPool: AConnectionPool<any>, erModel: ERModel): Promise<ERModel>;
  public static async reloadERModel(connection: AConnection,
                                    transaction: ATransaction,
                                    erModel: ERModel): Promise<ERModel>;
  public static async reloadERModel(param1: AConnection | AConnectionPool<any>,
                                    param2: ATransaction | ERModel,
                                    param3?: ERModel): Promise<ERModel> {
    if (param1 instanceof AConnection &&
      param2 instanceof ATransaction &&
      param3 instanceof ERModel) {
      param3.clear();

      const dbSchema = await Factory.FBDriver.readDBSchema(param1, param2);
      return await new ERExport(param1, param2, dbSchema, param3).execute();

    }
    if (param1 instanceof AConnectionPool &&
      param2 instanceof ERModel) {
      param2.clear();

      const dbSchema = await Factory.FBDriver.readDBSchema(param1);
      return await AConnectionPool.executeConnection({
        connectionPool: param1,
        callback: async (connection) => {
          let readTransaction;
          try {
            readTransaction = connection.readTransaction;
          } catch (error) {
            return await AConnection.executeTransaction({
              connection,
              options: {accessMode: AccessMode.READ_ONLY},
              callback: async (transaction) => {
                return await new ERExport(connection, transaction, dbSchema, param2).execute();
              }
            });
          }
          return await new ERExport(connection, readTransaction, dbSchema, param2).execute();
        }
      });
    }
    throw new Error("Incorrect arguments");
  }

  public static async defineEntity(connection: AConnection,
                                   transaction: ATransaction,
                                   erModel: ERModel,
                                   entity: Entity,
                                   pkValues: any[]): Promise<Entity> {
    return await new EntityDefiner(connection, transaction, erModel).defineEntity(entity, pkValues);
  }

  public static async openQueryCursor(connection: AConnection,
                                      transaction: ATransaction,
                                      query: EntityQuery): Promise<EQueryCursor> {
    return await EQueryCursor.open(connection, transaction, query);
  }

  public static async openSqlQueryCursor(connection: AConnection,
                                         transaction: ATransaction,
                                         erModel: ERModel,
                                         select: string,
                                         params: IParams): Promise<SqlQueryCursor> {
    return await SqlQueryCursor.open(connection, transaction, erModel, select, params);
  }

  public static async sqlQuery(connection: AConnection,
                               transaction: ATransaction,
                               erModel: ERModel,
                               select: string,
                               params: IParams): Promise<ISqlQueryResponse> {
    const cursor = await SqlQueryCursor.open(connection, transaction, erModel, select, params);
    try {
      let data: any[] = [];
      while (true) {
        const rows = await cursor.fetch(100);
        data = data.concat(rows.data);
        if (rows.finished) {
          break;
        }
      }

      return cursor.makeSqlQueryResponse(data);
    } finally {
      await cursor.close();
    }
  }

  public static async query(connection: AConnection,
                            transaction: ATransaction,
                            query: EntityQuery): Promise<IEntityQueryResponse> {
    const cursor = await EQueryCursor.open(connection, transaction, query);
    try {
      let data: any[] = [];
      while (true) {
        const rows = await cursor.fetch(100);
        data = data.concat(rows.data);
        if (rows.finished) {
          break;
        }
      }

      return cursor.makeEQueryResponse(data);
    } finally {
      await cursor.close();
    }
  }

  public static async insert(connection: AConnection,
                             transaction: ATransaction,
                             entityInsert: EntityInsert): Promise<any[]> {
    const insert = new Insert(entityInsert);
    const result = await connection.executeReturning(transaction, insert.sql, insert.params);

    return result.getAll();
  }

  public static async update(connection: AConnection,
                             transaction: ATransaction,
                             entityUpdate: EntityUpdate): Promise<void> {
    const update = new Update(entityUpdate);

    await connection.execute(transaction, update.sql, update.params);
  }

  public static async delete(connection: AConnection,
                             transaction: ATransaction,
                             entityDelete: EntityDelete): Promise<void> {
    const delete1 = new Delete(entityDelete);

    await connection.execute(transaction, delete1.sql, delete1.params);
  }
 
  public static async getSequence(connection: AConnection,
                                  transaction: ATransaction,
                                  sequence: SequenceQuery): Promise<ISequenceQueryResponse>{
    const getSequence = new GetSequence(sequence);

    const result = await connection.executeReturning(transaction, getSequence.sql);
    return {
      value: result.getNumber(0)
    }
  }

  public async dispose(): Promise<void> {
    await this.ddlHelper.dispose();
  }
}
