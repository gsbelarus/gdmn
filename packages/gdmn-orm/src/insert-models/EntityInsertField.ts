import {Attribute} from "../model/Attribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {DetailAttribute} from "../model/link/DetailAttribute";
import {EntityAttribute} from "../model/link/EntityAttribute";
import {SetAttribute} from "../model/link/SetAttribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";

export interface IEntityInsertFieldInspector {
  attribute: string;
  value: any;
  setAttributes?: IEntityInsertSetAttributesInspector[];
}

export interface IEntityInsertSetAttributesInspector {
  attribute: string;
  value: any;
}

export interface IEntityInsertSetAttributes {
  attribute: ScalarAttribute;
  value: any;
}

export class EntityInsertField {

  public readonly attribute: Attribute;
  public readonly value: any;
  public readonly setAttributes?: IEntityInsertSetAttributes[];

  constructor(attribute: Attribute, value: any, setAttributes?: IEntityInsertSetAttributes[]) {
    if (attribute.type === "Detail") {
      throw new Error("Attribute Detail not support yet");
    }
    this.attribute = attribute;
    this.value = value;
    this.setAttributes = setAttributes;
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
        return new EntityInsertField(attribute,
          inspector.value,
          inspector.setAttributes && inspector.setAttributes.map((attr) => ({
            attribute: attribute.attribute(attr.attribute),
            value: attr.value.value
          }))
        );
      }

      return new EntityInsertField(attribute, inspector.value);
    }
    if (attribute instanceof ScalarAttribute) {
      if (inspector.setAttributes) {
        throw new Error("EntityInsertField with ScalarAttribute must hasn't 'setAttributes' property");
      }
      return new EntityInsertField(attribute, inspector.value);
    }
    throw new Error("Should never happened");
  }

  public inspect(): IEntityInsertFieldInspector {
    const inspect: IEntityInsertFieldInspector = {attribute: this.attribute.name, value: this.value};
    if (this.setAttributes) {
      inspect.setAttributes = this.setAttributes.map((attr) => ({
        attribute: attr.attribute.name,
        value: attr.value
      }));
    }

    return inspect;
  }
}
