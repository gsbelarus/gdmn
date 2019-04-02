import {AConnection, AResultSet, ATransaction} from "gdmn-db";
import {EntityQuery, IEntityQueryResponse, IEntityQueryResponseFieldAliases} from "gdmn-orm";
import {ACursor} from "./ACursor";
import {Select} from "../crud/query/Select";

export class EQueryCursor extends ACursor {

  private readonly _select: Select;

  protected constructor(resultSet: AResultSet, select: Select) {
    super(resultSet);
    this._select = select;
  }

  public static async open(connection: AConnection, transaction: ATransaction, query: EntityQuery): Promise<EQueryCursor> {
    const select = new Select(query);

    const resultSet = await connection.executeQuery(transaction, select.sql, select.params);
    return new EQueryCursor(resultSet, select);
  }

  public makeEQueryResponse(data: any[]): IEntityQueryResponse {
    return {
      data,
      aliases: Array.from(this._select.fieldAliases).reduce((aliases, [field, values]) => (
        Array.from(values).reduce((map, [attribute, fieldAlias]) => {
            const link = this._select.query.link.deepFindLink(field);
            if (!link) {
              throw new Error(`Field with attribute ${field.attribute.name} is not found`);
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
        select: this._select.sql,
        params: this._select.params
      }
    };
  }
}
