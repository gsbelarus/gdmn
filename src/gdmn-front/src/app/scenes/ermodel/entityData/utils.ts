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
  EnumAttribute
} from 'gdmn-orm';
import { IFieldDef, TFieldType } from 'gdmn-recordset';

export function attr2fd(fieldAlias: string, _entity: Entity, attr: Attribute): IFieldDef {
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
    caption: attr.name
  };
}
