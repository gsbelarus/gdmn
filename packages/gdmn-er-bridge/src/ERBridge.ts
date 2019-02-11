import {AConnection, ATransaction, DBStructure, Factory, IBaseExecuteOptions} from "gdmn-db";
import {EntityQuery, ERModel, IEntityQueryResponse} from "gdmn-orm";
import {EntityBuilder} from "./ddl/builder/EntityBuilder";
import {ERModelBuilder} from "./ddl/builder/ERModelBuilder";
import {DDLHelper} from "./ddl/DDLHelper";
import {ERExport} from "./ddl/export/ERExport";
import {DBSchemaUpdater} from "./ddl/updates/DBSchemaUpdater";
import {EQueryCursor} from "./EQueryCursor";

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

  public static async openQueryCursor(connection: AConnection,
                                      transaction: ATransaction,
                                      query: EntityQuery): Promise<EQueryCursor> {
    return await EQueryCursor.open(connection, transaction, query);
  }

  public static async initDatabase(connection: AConnection): Promise<void> {
    await new DBSchemaUpdater(connection).run();
  }

  public static async reloadERModel(connection: AConnection,
                                    transaction: ATransaction,
                                    erModel: ERModel,
                                    dbStructure?: DBStructure): Promise<ERModel> {
    if (!dbStructure) {
      dbStructure = await Factory.FBDriver.readDBStructure(connection, transaction);
    }
    erModel.clear();
    return await new ERExport(connection, transaction, dbStructure, erModel).execute();
  }

  public async dispose(): Promise<void> {
    await this.ddlHelper.dispose();
  }

  public async query(query: EntityQuery): Promise<IEntityQueryResponse> {
    const {connection, transaction} = this.ddlHelper;

    const cursor = await EQueryCursor.open(connection, transaction, query);
    let result: any[] = [];
    let rows;
    while (!(rows = await cursor.fetch(1)).finished) {
      result = result.concat(rows);
    }

    return cursor.makeEntityQueryResponse(result);
  }
}
