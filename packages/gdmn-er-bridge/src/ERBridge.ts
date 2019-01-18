import {AConnection, ATransaction, DBStructure, Factory, IBaseExecuteOptions} from "gdmn-db";
import {EntityQuery, ERModel, IEntityQueryResponse, IEntityQueryResponseFieldAliases} from "gdmn-orm";
import {Select} from "./crud/query/Select";
import {EntityBuilder} from "./ddl/builder/EntityBuilder";
import {ERModelBuilder} from "./ddl/builder/ERModelBuilder";
import {DDLHelper} from "./ddl/DDLHelper";
import {ERExport} from "./ddl/export/ERExport";
import {DBSchemaUpdater} from "./ddl/updates/DBSchemaUpdater";

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
    const {sql, params, fieldAliases} = new Select(query);

    const data = await AConnection.executeQueryResultSet({
      connection,
      transaction,
      sql,
      params,
      callback: async (resultSet) => {
        const result = [];
        while (await resultSet.next()) {
          const row: { [key: string]: any } = {};
          for (let i = 0; i < resultSet.metadata.columnCount; i++) {
            // TODO binary blob support
            row[resultSet.metadata.getColumnLabel(i)] = await resultSet.getAny(i);
          }
          result.push(row);
        }
        return result;
      }
    });

    return {
      data,
      aliases: Array.from(fieldAliases).reduce((aliases, [field, values]) => (
        Array.from(values).reduce((map, [attribute, fieldAlias]) => {
            const link = query.link.deepFindLink(field);
            if (!link) {
              throw new Error("Field not found");
            }
            return {
              ...aliases,
              [fieldAlias]: {
                linkAlias: link.alias,
                attribute: field.attribute.name,
                setAttribute: field.attribute.type === "Set" && field.attribute !== attribute
                  ? attribute.name : undefined
              }
            };
          }, aliases
        )
      ), {} as IEntityQueryResponseFieldAliases),
      info: {
        select: sql,
        params
      }
    };
  }
}
