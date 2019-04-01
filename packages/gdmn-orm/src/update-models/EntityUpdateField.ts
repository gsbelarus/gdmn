import {Attribute} from "../model/Attribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {DetailAttribute} from "../model/link/DetailAttribute";
import {EntityAttribute} from "../model/link/EntityAttribute";
import {SetAttribute} from "../model/link/SetAttribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";

export interface IEntityUpdateSetAttributesInspector {
  attribute: string;
  value: any;
}

export type TEntityUpdateFieldSet = Array<{
  pkValues: any[];
  setAttributes?: IEntityUpdateSetAttributes[];
}>;

export interface IEntityUpdateSetAttributes {
  attribute: ScalarAttribute;
  value: any;
}

export type TEntityUpdateFieldSetInspector = Array<{
  pkValues: any[];
  setAttributes?: IEntityUpdateSetAttributesInspector[];
}>;

export interface IEntityUpdateFieldInspector {
  attribute: string;
  value: any | TEntityUpdateFieldSetInspector;
}

export class EntityUpdateField {

  public readonly attribute: Attribute;
  public readonly value: any | TEntityUpdateFieldSet;

  constructor(attribute: Attribute, value: any | TEntityUpdateFieldSet) {
    this.attribute = attribute;
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
        if (Array.isArray(inspector.value)) {
          return new EntityUpdateField(attribute,
            (inspector.value as TEntityUpdateFieldSetInspector).map((attr) => {
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
      return new EntityUpdateField(attribute, inspector.value);
    }
    if (attribute instanceof ScalarAttribute) {
      // if (inspector.setAttributes) {
      //   throw new Error("EntityUpdateField with ScalarAttribute must hasn't 'setAttributes' property");
      // }
      return new EntityUpdateField(attribute, inspector.value);
    }
    throw new Error("Should never happened");
  }

  public inspect(): IEntityUpdateFieldInspector {
    let value: any | TEntityUpdateFieldSet;
    if (Array.isArray(this.value)) {
      value = (this.value as TEntityUpdateFieldSet).map((attr) => ({
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
