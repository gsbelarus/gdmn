import {Attribute} from "../model/Attribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityAttribute} from "../model/link/EntityAttribute";
import {SetAttribute} from "../model/link/SetAttribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {EntityLink, IEntityLinkInspector} from "./EntityLink";

export interface IEntityLinkFieldInspector {
  attribute: string;
  setAttributes?: string[];
  links?: IEntityLinkInspector[];
}

export class EntityLinkField {

  public readonly attribute: Attribute;
  public readonly links?: EntityLink[];
  public readonly setAttributes?: ScalarAttribute[];

  constructor(attribute: Attribute, links?: EntityLink[], setAttributes?: ScalarAttribute[]) {
    this.attribute = attribute;
    if (attribute instanceof EntityAttribute) {
      if (!links || !links.length) {
        throw new Error("EntityLinkField with EntityAttribute must has 'links' property");
      }
      for (const link of links) {
        if (!attribute.entities.includes(link.entity)) {
          throw new Error(`Attribute can't link to entity "${link.entity.name}"`);
        }
      }
      if (attribute instanceof SetAttribute) {
        if (setAttributes) {
          for (const setAttribute of setAttributes) {
            if (!Object.values(attribute.attributes).includes(setAttribute)) {
              throw new Error(`SetAttribute has no attribute "${attribute.attributes}"`);
            }
          }
        }
      } else {
        if (setAttributes) {
          throw new Error("EntityLinkField without SetAttribute must hasn't 'setAttributes' property");
        }
      }
    }
    if (attribute instanceof ScalarAttribute) {
      if (links && !links.length) {
        throw new Error("EntityLinkField with ScalarAttribute must hasn't 'links' property");
      }
      if (setAttributes) {
        throw new Error("EntityLinkField with ScalarAttribute must hasn't 'setAttributes' property");
      }
    }
    this.links = links;
    this.setAttributes = setAttributes;
  }

  public static inspectorToObject(erModel: ERModel,
                                  entity: Entity,
                                  inspector: IEntityLinkFieldInspector): EntityLinkField {
    const attribute = entity.attribute(inspector.attribute);

    return new EntityLinkField(attribute,
      inspector.links && inspector.links.map((link) => EntityLink.inspectorToObject(erModel, link)),
      inspector.setAttributes && inspector.setAttributes.map((attrName) => {
        const setAttr = attribute as SetAttribute;
        return setAttr.attribute(attrName);
      })
    );
  }

  public inspect(): IEntityLinkFieldInspector {
    const inspect: IEntityLinkFieldInspector = {attribute: this.attribute.name};
    if (this.links) {
      inspect.links = this.links.map((link) => link.inspect());
    }
    if (this.setAttributes) {
      inspect.setAttributes = this.setAttributes.map((attr) => attr.name);
    }
    return inspect;
  }
}
