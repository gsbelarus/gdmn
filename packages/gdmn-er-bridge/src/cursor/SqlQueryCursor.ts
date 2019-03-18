import {AConnection, AResultSet, ATransaction, IParams, Types} from "gdmn-db";
import {ERModel} from "gdmn-orm";
import {ACursor, IFetchResponseDataItem} from "./ACursor";

export interface ISqlQueryResponseAliases {
  [alias: string]: {
    type: Types;
    field?: string;
    relation?: string;
    entity?: string;
    attribute?: string;
  }
}

export interface ISqlQueryResponse {
  data: IFetchResponseDataItem[];
  aliases: ISqlQueryResponseAliases;
}

export class SqlQueryCursor extends ACursor {

  public erModel: ERModel;

  constructor(resultSet: AResultSet, erModel: ERModel) {
    super(resultSet);
    this.erModel = erModel;
  }

  public static async open(connection: AConnection,
                           transaction: ATransaction,
                           erModel: ERModel,
                           sql: string,
                           params: IParams): Promise<SqlQueryCursor> {
    const resultSet = await connection.executeQuery(transaction, sql, params);
    return new SqlQueryCursor(resultSet, erModel);
  }

  public makeSqlQueryResponse(data: any[]): ISqlQueryResponse {
    const metadata = this._resultSet.metadata;
    const aliases: ISqlQueryResponseAliases = {};
    for (let i = 0; i < this._resultSet.metadata.columnCount; i++) {
      const label = metadata.getColumnLabel(i)!;
      const type = metadata.getColumnType(i);
      const relation = metadata.getColumnRelation(i);
      const field = metadata.getColumnName(i);
      aliases[label] = {
        type,
        field,
        relation
      };
      if (relation && field) {
        for (const entity of Object.values(this.erModel.entities)) {
          // TODO check base entity and cross tables
          if (entity.adapter!.relation.some((rel) => rel.relationName === relation)) {
            aliases[label].entity = entity.name;
            for (const attribute of Object.values(entity.ownAttributes)) {
              if (attribute.adapter.relation === relation && attribute.adapter.field1 === field) {
                aliases[label].attribute = attribute.name;
                break;
              }
            }
            break;
          }
        }
      }
    }

    return {
      data,
      aliases
    };
  }
}
