import {AccessMode, AConnection, DBStructure} from "gdmn-db";
import {EntityQuery, ERModel, IEntityQueryInspector} from "gdmn-orm";
import {IQueryResponse} from "../../ERBridge";
import {SelectBuilder} from "./SelectBuilder";

// TODO remove
export abstract class Query {

  public static async execute(connection: AConnection, erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse> {
    const bodyQuery = EntityQuery.inspectorToObject(erModel, query);

    const {sql, params, fieldAliases} = new SelectBuilder(dbStructure, bodyQuery).build();

    const data = await AConnection.executeTransaction({
      connection,
      options: {accessMode: AccessMode.READ_ONLY},
      callback: (transaction) => AConnection.executeQueryResultSet({
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
      })
    });

    const aliases = [];
    for (const [key, value] of fieldAliases) {
      const link = bodyQuery.link.deepFindLinkByField(key);
      if (!link) {
        throw new Error("Field not found");
      }
      aliases.push({
        alias: link.alias,
        attribute: key.attribute.name,
        values: value
      });
    }

    return {
      data,
      aliases,
      sql: {
        query: sql,
        params
      }
    };
  }
}
