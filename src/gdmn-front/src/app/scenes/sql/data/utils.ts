import { Types, ISqlQueryResponseAliasesOrm, ISqlQueryResponseAliasesRdb } from '@gdmn/server-api';
import { IFieldDef, TFieldType } from 'gdmn-recordset';

export function attr2fd(fieldAlias: string, eqfa: {rdb: ISqlQueryResponseAliasesRdb, orm?: ISqlQueryResponseAliasesOrm} ): IFieldDef {
  // const link = query.link.deepFindLink(eqfa.linkAlias)!;
  // const findField = link.fields.find( field => field.attribute.name === eqfa.attribute );

  // if (!findField) {
  // throw new Error('Invalid query data!');
  // }

  let dataType;
  let size: number | undefined = undefined;

  // dataType = TFieldType.String;
   switch(eqfa.rdb.type) {
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
      console.log(eqfa.rdb);
      throw new Error(`Unsupported attribute type ${eqfa.rdb.type} of ${eqfa.rdb.field!}`);
  }

  const caption = eqfa.rdb.field!;

  return {
    fieldName: fieldAlias,
    dataType,
    size,
    caption
  };
}
