import {Attribute} from "../model/Attribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {DetailAttribute} from "../model/link/DetailAttribute";
import {EntityAttribute} from "../model/link/EntityAttribute";
import {SetAttribute} from "../model/link/SetAttribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {TValue} from "../types";

export interface IEntityInsertFieldInspector {
  attribute: string;
  value: TValue | TEntityInsertFieldSetInspector;
}

export interface IEntityInsertSetAttributesInspector {
  attribute: string;
  value: TValue;
}

export type TEntityInsertFieldSetInspector = Array<{
  pkValues: TValue[];
  setAttributes?: IEntityInsertSetAttributesInspector[];
}>;

export type TEntityInsertFieldSet = Array<{
  pkValues: TValue[];
  setAttributes?: IEntityInsertSetAttributes[];
}>;

export interface IEntityInsertSetAttributes {
  attribute: ScalarAttribute;
  value: TValue;
}

export class EntityInsertField {

  public readonly attribute: Attribute;
  public readonly value: TValue | TEntityInsertFieldSet;

  constructor(attribute: Attribute, value: any | TEntityInsertFieldSet) {
    this.attribute = attribute;
    if (attribute.type === "Detail") {
      throw new Error("Attribute Detail not support yet");
    }
    if (attribute.type === "Set" && EntityInsertField._isValuePrimitive(value)) {
      throw new Error("Value should not be a primitive with SetAttribute");
    }
    if (attribute instanceof EntityAttribute && attribute.type !== "Set"
      && !EntityInsertField._isValuePrimitive(value)) {
      throw new Error("Value should be a primitive with EntityAttribute");
    }
    if (attribute instanceof ScalarAttribute && !EntityInsertField._isValuePrimitive(value)) {
      throw new Error("Value should be a primitive with ScalarAttribute");
    }
    this.value = value;
  }

  public static inspectorToObject(erModel: ERModel,
                                  entity: Entity,
                                  inspector: IEntityInsertFieldInspector): EntityInsertField {
    const attribute = entity.attribute(inspector.attribute);
    if (attribute instanceof EntityAttribute) {
      if (attribute instanceof DetailAttribute) {
        throw new Error("Attribute Detail not support yet");
      }
      if (attribute instanceof SetAttribute) {
        if (EntityInsertField._isValuePrimitiveInspector(inspector.value)) {
          throw new Error("Value should be a primitive with SetAttribute");
        }
        if (!EntityInsertField._isValuePrimitiveInspector(inspector.value)) {
          return new EntityInsertField(attribute,
            (inspector.value as TEntityInsertFieldSetInspector).map((attr) => {
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
      if (!EntityInsertField._isValuePrimitiveInspector(inspector.value)) {
        throw new Error("Value should be a primitive with EntityAttribute");
      }
      return new EntityInsertField(attribute, inspector.value);
    }
    if (!EntityInsertField._isValuePrimitiveInspector(inspector.value)) {
      throw new Error("Value should be a primitive with ScalarAttribute");
    }
    return new EntityInsertField(attribute, inspector.value);
  }

  private static _isValuePrimitiveInspector(
    value: TValue | TEntityInsertFieldSetInspector
  ): value is TValue {
    return !Array.isArray(value);
  }

  private static _isValuePrimitive(value: TValue | TEntityInsertFieldSet): value is TValue {
    return !Array.isArray(value);
  }

  public inspect(): IEntityInsertFieldInspector {
    let value: any | TEntityInsertFieldSet;
    if (Array.isArray(this.value)) {
      value = (this.value as TEntityInsertFieldSet).map((attr) => ({
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
