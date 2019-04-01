import {Attribute} from "../model/Attribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {DetailAttribute} from "../model/link/DetailAttribute";
import {EntityAttribute} from "../model/link/EntityAttribute";
import {SetAttribute} from "../model/link/SetAttribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";

export interface IEntityInsertFieldInspector {
  attribute: string;
  value: any | TEntityInsertFieldSetInspector;
}

export interface IEntityInsertSetAttributesInspector {
  attribute: string;
  value: any;
}

export type TEntityInsertFieldSetInspector = Array<{
  pkValues: any[];
  setAttributes?: IEntityInsertSetAttributesInspector[];
}>;

export type TEntityInsertFieldSet = Array<{
  pkValues: any[];
  setAttributes?: IEntityInsertSetAttributes[];
}>;

export interface IEntityInsertSetAttributes {
  attribute: ScalarAttribute;
  value: any;
}

export class EntityInsertField {

  public readonly attribute: Attribute;
  public readonly value: any | TEntityInsertFieldSet;

  constructor(attribute: Attribute, value: any | TEntityInsertFieldSet) {
    if (attribute.type === "Detail") {
      throw new Error("Attribute Detail not support yet");
    }
    if (attribute.type === "Set") {
      if (Array.isArray(value)) {
        value.map((entry) => {
          if (!entry.pkValues && !entry.setAttributes) {
            throw new Error("Value pkValues and setAttributes should not be undefined");
          }
        });
      }
    }
    this.attribute = attribute;
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
        if (Array.isArray(inspector.value)) {
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
        }
      }
      return new EntityInsertField(attribute, inspector.value);
    }
    if (attribute instanceof ScalarAttribute) {
      return new EntityInsertField(attribute, inspector.value);
    }
    throw new Error("Should never happened");
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
