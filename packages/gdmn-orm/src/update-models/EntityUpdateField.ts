import {Attribute} from "../model/Attribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {DetailAttribute} from "../model/link/DetailAttribute";
import {EntityAttribute} from "../model/link/EntityAttribute";
import {SetAttribute} from "../model/link/SetAttribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {TValue} from "../types";

export interface IEntityUpdateSetAttributesInspector {
  attribute: string;
  value: TValue;
}

export type TEntityUpdateFieldSet = Array<{
  pkValues: TValue[];
  setAttributes?: IEntityUpdateSetAttributes[];
}>;

export interface IEntityUpdateSetAttributes {
  attribute: ScalarAttribute;
  value: TValue;
}

export type TEntityUpdateFieldSetInspector = Array<{
  pkValues: TValue[];
  setAttributes?: IEntityUpdateSetAttributesInspector[];
}>;

export interface IEntityUpdateFieldInspector {
  attribute: string;
  value: TValue | TEntityUpdateFieldSetInspector;
}

export class EntityUpdateField {

  public readonly attribute: Attribute;
  public readonly value: TValue | TEntityUpdateFieldSet;

  constructor(attribute: Attribute, value: TValue | TEntityUpdateFieldSet) {
    this.attribute = attribute;
    if (attribute.type === "Detail") {
      throw new Error("Attribute Detail not support yet");
    }
    if (attribute.type === "Set" && EntityUpdateField._isValuePrimitive(value)) {
      throw new Error("Value should not be a primitive with SetAttribute");
    }
    if (attribute instanceof EntityAttribute
      && attribute.type !== "Set" && !EntityUpdateField._isValuePrimitive(value)) {
      throw new Error("Value should be a primitive with EntityAttribute");
    }
    if (attribute instanceof ScalarAttribute && !EntityUpdateField._isValuePrimitive(value)) {
      throw new Error("Value should be a primitive with ScalarAttribute");
    }
    this.value = value;
  }

  public static inspectorToObject(erModel: ERModel,
                                  entity: Entity,
                                  inspector: IEntityUpdateFieldInspector): EntityUpdateField {
    const attribute = entity.attribute(inspector.attribute);
    if (attribute instanceof EntityAttribute) {
      if (attribute instanceof DetailAttribute) {
        throw new Error("Attribute Detail not support yet");
      }
      if (attribute instanceof SetAttribute) {
        if (EntityUpdateField._isValuePrimitiveInspector(inspector.value)) {
          throw new Error("Value should be a primitive with SetAttribute");
        }
        if (!EntityUpdateField._isValuePrimitiveInspector(inspector.value)) {
          return new EntityUpdateField(attribute,
            inspector.value.map((attr) => {
                return {
                  pkValues: attr.pkValues,
                  setAttributes: attr.setAttributes && attr.setAttributes.map((s) => {
                    const setAttribute = attribute.attribute(s.attribute);
                    return {
                      attribute: setAttribute,
                      value: s.value
                    };
                  })
                };
              }
            ));
        }}
      if (!EntityUpdateField._isValuePrimitiveInspector(inspector.value)) {
        throw new Error("Value should be a primitive with EntityAttribute");
      }
      return new EntityUpdateField(attribute, inspector.value);
    }
    if (!EntityUpdateField._isValuePrimitiveInspector(inspector.value)) {
      throw new Error("Value should be a primitive with ScalarAttribute");
    }
    return new EntityUpdateField(attribute, inspector.value);
  }

  private static _isValuePrimitiveInspector(
    value: TValue | TEntityUpdateFieldSetInspector
  ): value is TValue {
    return !Array.isArray(value);
  }

  private static _isValuePrimitive(value: TValue | TEntityUpdateFieldSet): value is TValue {
    return !Array.isArray(value);
  }

  public inspect(): IEntityUpdateFieldInspector {
    let value: TValue | TEntityUpdateFieldSetInspector;
    if (!EntityUpdateField._isValuePrimitive(this.value)) {
      value = this.value.map((attr) => ({
        pkValues: attr.pkValues,
        setAttributes: attr.setAttributes && attr.setAttributes.map((s) => ({
          attribute: s.attribute.name,
          value: s.value
        }))
      }));
    } else {
      value = this.value;
    }
    return {
      attribute: this.attribute.name,
      value
    };
  }
}
