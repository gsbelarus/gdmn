import { TSQLFieldType, ISqlQueryResponseAliasesOrm, ISqlQueryResponseAliasesRdb } from '@gdmn/server-api';
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
    case TSQLFieldType.CHAR:
    case TSQLFieldType.VARCHAR:
    case TSQLFieldType.BLOB:
      dataType = TFieldType.String;
      break;
    case TSQLFieldType.SMALL_INTEGER:
    case TSQLFieldType.BIG_INTEGER:
    case TSQLFieldType.INTEGER:
      dataType = TFieldType.Integer;
      break;
    case TSQLFieldType.DOUBLE:
    case TSQLFieldType.FLOAT:
      dataType = TFieldType.Float;
      break;
    case TSQLFieldType.DATE:
    case TSQLFieldType.TIME:
    case TSQLFieldType.TIMESTAMP:
      dataType = TFieldType.Date;
      break;
    // case "Boolean":
    //   dataType = TFieldType.Boolean;
    //   break;
    // case "Numeric":
    //   dataType = TFieldType.Currency;
    //   break;
    default:
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
