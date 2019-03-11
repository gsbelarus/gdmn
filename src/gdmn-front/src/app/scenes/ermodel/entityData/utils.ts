import { IEntityQueryResponseFieldAlias, EntityQuery } from 'gdmn-orm';
import { IFieldDef, TFieldType } from 'gdmn-recordset';

export function attr2fd(query: EntityQuery, fieldAlias: string, eqfa: IEntityQueryResponseFieldAlias): IFieldDef {
  const link = query.link.deepFindLink(eqfa.linkAlias)!;
  const findField = link.fields.find( field => field.attribute.name === eqfa.attribute );

  if (!findField) {
    throw new Error('Invalid query data!');
  }

  const attr = findField.attribute;
  let dataType;
  let size: number | undefined = undefined;

  switch(attr.type) {
    case "Enum":
    case "String":
      dataType = TFieldType.String;
      break;
    case "Sequence":
    case "Integer":
      dataType = TFieldType.Integer;
      break;
    case "Float":
      dataType = TFieldType.Float;
      break;
    case "TimeStamp":
    case "Time":
    case "Date":
      dataType = TFieldType.Date;
      break;
    case "Boolean":
      dataType = TFieldType.Boolean;
      break;
    case "Numeric":
      dataType = TFieldType.Currency;
      break;
    default:
      throw new Error(`Unsupported attribute type ${attr.type} of ${attr.name}`);
  }

  const caption = attr.name;
  return {
    fieldName: fieldAlias,
    dataType,
    size,
    caption,
    eqfa
  };
}
