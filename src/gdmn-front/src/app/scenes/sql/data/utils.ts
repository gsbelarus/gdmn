import { Types, ISqlQueryResponseAliasesOrm, ISqlQueryResponseAliasesRdb } from 'gdmn-internals';
import { IFieldDef, TFieldType } from 'gdmn-recordset';

export function sql2fd(fieldAlias: string, sqlfa: {rdb: ISqlQueryResponseAliasesRdb, orm?: ISqlQueryResponseAliasesOrm} ): IFieldDef {

  let dataType;
  let size: number | undefined = undefined;

  switch(sqlfa.rdb.type) {
    case Types.CHAR:
    case Types.VARCHAR:
    case Types.BLOB:
      dataType = TFieldType.String;
      break;
    case Types.SMALLINT:
    case Types.BIGINT:
    case Types.INTEGER:
      dataType = TFieldType.Integer;
      break;
    case Types.DOUBLE:
    case Types.FLOAT:
      dataType = TFieldType.Float;
      break;
    case Types.DATE:
    case Types.TIME:
    case Types.TIMESTAMP:
      dataType = TFieldType.Date;
      break;
    case Types.BOOLEAN:
      dataType = TFieldType.Boolean;
    default:
      console.log(sqlfa.rdb);
      throw new Error(`Unsupported attribute type ${sqlfa.rdb.type} of ${sqlfa.rdb.field!}`);
  }

  const caption = `${sqlfa.rdb.relation}.${sqlfa.rdb.label}`;

  return {
    fieldName: fieldAlias,
    dataType,
    size,
    caption,
    sqlfa
  };
}
