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

export interface IEntityUpdateSetAttributes {
  attribute: ScalarAttribute;
  value: any;
}

export interface IEntityUpdateFieldInspector {
  attribute: string;
  value: any;
  setAttributes?: IEntityUpdateSetAttributesInspector[];
}

export class EntityUpdateField {

  public readonly attribute: Attribute;
  public readonly value: any;
  public readonly setAttributes?: IEntityUpdateSetAttributes[];

  constructor(attribute: Attribute, value: any, setAttributes?: IEntityUpdateSetAttributes[]) {
    this.attribute = attribute;
    if (attribute.type === "Detail") {
      throw new Error("Attribute Detail not support yet");
    }
    this.value = value;
    this.setAttributes = setAttributes;
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
        return new EntityUpdateField(attribute, inspector.value,
          inspector.setAttributes && inspector.setAttributes.map((attr) => {
            const findItem = Object.values(attribute.attributes).find((item) => item.name === attr.attribute);
            return {
              attribute: findItem ? findItem : attribute as ScalarAttribute,
              value: attr.value.value
            };
          })
        );
      }
      return new EntityUpdateField(attribute, inspector.value);
    }
    if (attribute instanceof ScalarAttribute) {
      if (inspector.setAttributes) {
        throw new Error("EntityUpdateField with ScalarAttribute must hasn't 'setAttributes' property");
      }
      return new EntityUpdateField(attribute, inspector.value);
    }
    throw new Error("Should never happened");

  }

  public inspect(): IEntityUpdateFieldInspector {
    const inspect: IEntityUpdateFieldInspector = {attribute: this.attribute.name, value: this.value};
    if (this.setAttributes) {
      inspect.setAttributes = this.setAttributes.map((attr) => ({
        attribute: attr.attribute.name, value: attr.value
      }));
    }

    return inspect;
  }
}
