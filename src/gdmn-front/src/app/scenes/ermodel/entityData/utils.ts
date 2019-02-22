import {
  Attribute,
  DateAttribute,
  Entity,
  FloatAttribute,
  IntegerAttribute,
  NumberAttribute,
  SequenceAttribute,
  StringAttribute,
  BooleanAttribute,
  EnumAttribute,
  IEntityQueryResponseFieldAlias,
  EntityQuery
} from 'gdmn-orm';
import { IFieldDef, TFieldType } from 'gdmn-recordset';

export function attr2fd(q: EntityQuery, fieldAlias: string, eqfa: IEntityQueryResponseFieldAlias): IFieldDef {
  const link = q.link.deepFindLink(eqfa.linkAlias)!;
  const findField = link.fields.find( field => field.attribute.name === eqfa.attribute );

  if (!findField) {
    throw new Error('Invalid query data!');
  }

  /*
  if (data.setAttribute) {
    const setAttribute = findField.setAttributes!.find((attr) => attr.name === data.setAttribute);
    return {alias, attribute: findField.attribute, setAttribute};
  }
  */

  const attr = findField.attribute;
  let dataType;
  let size: number | undefined = undefined;

  if (attr instanceof StringAttribute) {
    dataType = TFieldType.String;
  } else if (attr instanceof IntegerAttribute || attr instanceof SequenceAttribute) {
    dataType = TFieldType.Integer;
  } else if (attr instanceof FloatAttribute) {
    dataType = TFieldType.Float;
  } else if (attr instanceof DateAttribute) {
    dataType = TFieldType.Date;
  } else if (attr instanceof NumberAttribute) {
    dataType = TFieldType.Currency;
  } else if (attr instanceof BooleanAttribute) {
    dataType = TFieldType.Boolean;
  } else if (attr instanceof EnumAttribute) {
    dataType = TFieldType.String;
  } else {
    throw new Error(`Unsupported attribute type ${attr.type} of ${attr.name}`);
  }

  return {
    fieldName: fieldAlias,
    dataType,
    size,
    caption: attr.name,
    eqfa
  };
}
