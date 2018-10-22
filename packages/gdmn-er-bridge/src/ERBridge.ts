import {AConnection, ATransaction, DBStructure} from "gdmn-db";
import {ERModel, IEntityQueryInspector} from "gdmn-orm";
import {Query} from "./crud/query/Query";
import {ERExport} from "./ddl/export/ERExport";

export interface IQueryResponse {
  data: any[];
  aliases: Array<{ alias: string, attribute: string, values: any }>;
  sql: {
    query: string;
    params: { [field: string]: any };
  };
}

export class ERBridge {

  private readonly _connection: AConnection;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  public async exportFromDatabase(dbStructure: DBStructure,
                                  transaction: ATransaction,
                                  erModel: ERModel = new ERModel()): Promise<ERModel> {
    return await new ERExport(this._connection, transaction, dbStructure, erModel).execute();
    // return await erexport_old(dbStructure, this._connection, transaction, erModel);
  }

  public async query(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse> {
    return await Query.execute(this._connection, erModel, dbStructure, query);
  }
}
