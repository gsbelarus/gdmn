import { Types, ISqlQueryResponseAliasesOrm, ISqlQueryResponseAliasesRdb } from 'gdmn-internals';
import { IFieldDef, TFieldType } from 'gdmn-recordset';
// import { AttributeTypes } from 'gdmn-orm';
import { ISQLField } from './Sql';

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
      throw new Error(`Unsupported attribute type ${sqlfa.rdb.type} of ${sqlfa.rdb.field!}`);
  }

  const caption = sqlfa.rdb.label; // Как вариант выводить с таблицей `${sqlfa.rdb.relation}.${sqlfa.rdb.label}`;

  return {
    fieldName: fieldAlias,
    dataType,
    size,
    caption,
    sqlfa
  };
}

export function sqlParams2params(params: {name: string, type: Types} ): ISQLField {
  const {name, type } = params;
  let dataType;

  switch(type) {
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
      throw new Error(`Unsupported attribute type ${params.type} of ${params.type}`);
  }

  return {
    name,
    type: dataType
  };
}
