import {AConnection, AResultMetadata, AResultSet, ATransaction} from "gdmn-db";
import {
  EntityQuerySet,
  IEntityQuerySetResponse,
  IEntityQuerySetResponseFieldAliases
} from "gdmn-orm";
import {ACursor} from "./ACursor";
import {SelectSet} from "../crud/query/SelectSet";

export class EQuerySetCursor extends ACursor {

  private readonly _selectSet: SelectSet;

  protected constructor(resultSet: AResultSet, selectSet: SelectSet) {
    super(resultSet);
    this._selectSet = selectSet;
  }

  public static async open(connection: AConnection, transaction: ATransaction, querySet: EntityQuerySet): Promise<EQuerySetCursor> {
    const selectSet = new SelectSet(querySet);

    const resultSet = await connection.executeQuery(transaction, selectSet.sql, selectSet.params);
    return new EQuerySetCursor(resultSet, selectSet);
  }

  public makeEQuerySetResponse(data: any[]): IEntityQuerySetResponse {
    return {
      data,
      aliases: Array.from(this._selectSet.fieldAliases).reduce((aliases, [field, values]) => (
        Array.from(values).reduce((map, [attribute, fieldAlias]) => {
            const link = this._selectSet.query.link.deepFindLink(field);
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
      ), {} as IEntityQuerySetResponseFieldAliases),
      info: {
        select: this._selectSet.sql,
        params: this._selectSet.params
      }
    };
  }

  protected _getFieldAlias(metadata: AResultMetadata, index: number): string {
    return metadata.getColumnLabel(index)!;
  }
}
