import {AConnection, AResultSet, ATransaction, IParams, Types} from "gdmn-db";
import {Attribute, AttributeTypes, Entity, EntityAttribute, ERModel, ScalarAttribute} from "gdmn-orm";
import {ACursor, IFetchResponseDataItem} from "./ACursor";

export interface ISqlQueryResponseAliasesRdb {
  type: Types;
  field?: string;
  relation?: string;
}

export interface ISqlQueryResponseAliasesOrm {
  type: AttributeTypes;
  entity?: string;
}

export interface ISqlQueryResponseAliases {
  [alias: string]: {
    rdb: ISqlQueryResponseAliasesRdb,
    orm?: ISqlQueryResponseAliasesOrm;
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
    for (let i = 0; i < metadata.columnCount; i++) {
      const label = metadata.getColumnLabel(i)!;
      const type = metadata.getColumnType(i);
      const relation = metadata.getColumnRelation(i);
      const field = metadata.getColumnName(i);

      aliases[label] = {
        rdb: {
          type,
          relation,
          field
        }
      };

      if (relation && field) {
        const entity = this.erModel.relation2Entity[relation];
        if (entity) {
          const attribute = this._defineAttribute(entity, relation, field);
          if (attribute) {
            const orm: ISqlQueryResponseAliasesOrm = {
              type: attribute.type
            };
            if (attribute instanceof EntityAttribute) {
              orm.entity = attribute.entities[0].name;
            } else if (entity.pk.includes(attribute)) {
              orm.entity = entity.name;
            }
            aliases[label].orm = orm;
          }
        }
      }
    }

    return {
      data,
      aliases
    };
  }

  private _defineAttribute(entity: Entity, relation: string, field: string): Attribute | undefined {
    const attribute = Object.values(entity.ownAttributes).find((attr) => {
      if (attr instanceof ScalarAttribute) {
        return attr.adapter.relation === relation && attr.adapter.field === field;

      } else if (attr instanceof EntityAttribute) {
        switch (attr.type) {
          case "Entity":
            return attr.adapter.relation === relation && attr.adapter.field === field;
          default:
            return false;
        }
      }
      return false;
    });

    if (attribute) {
      return attribute;
    }

    const children0 = Object.values(this.erModel.entities).filter((e) => e.parent === entity);
    for (const child of children0) {
      const definedAttribute = this._defineAttribute(child, relation, field);
      if (definedAttribute) {
        return definedAttribute;
      }
    }
  }
}
