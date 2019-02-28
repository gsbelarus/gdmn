import {Attribute} from "../model/Attribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityAttribute} from "../model/link/EntityAttribute";
import {SetAttribute} from "../model/link/SetAttribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {EntityLink, IEntityLinkInspector} from "./EntityLink";

export interface IEntityQueryFieldInspector {
  attribute: string;
  setAttributes?: string[];
  links?: IEntityLinkInspector[];
}

export class EntityQueryField {

  public readonly attribute: Attribute;
  public readonly links?: EntityLink[];
  public readonly setAttributes?: ScalarAttribute[];

  constructor(attribute: Attribute, links?: EntityLink[], setAttributes?: ScalarAttribute[]) {
    this.attribute = attribute;
    if (attribute instanceof EntityAttribute) {
      if (!links || !links.length) {
        throw new Error("EntityQueryField with EntityAttribute must has 'links' property");
      }
      for (const link of links) {
        if (!attribute.entities.includes(link.entity)) {
          throw new Error(`Attribute can't link to entity "${link.entity.name}"`);
        }
      }
    }
    if (attribute instanceof ScalarAttribute) {
      if (links && !links.length) {
        throw new Error("EntityQueryField with ScalarAttribute must hasn't 'links' property");
      }
      if (setAttributes) {
        throw new Error("EntityQueryField with ScalarAttribute must hasn't 'setAttributes' property");
      }
    }
    this.links = links;
    this.setAttributes = setAttributes;
  }

  public static inspectorToObject(erModel: ERModel,
                                  entity: Entity,
                                  inspector: IEntityQueryFieldInspector): EntityQueryField {
    const attribute = entity.attribute(inspector.attribute);

    return new EntityQueryField(attribute,
      inspector.links && inspector.links.map((link) => EntityLink.inspectorToObject(erModel, link)),
      inspector.setAttributes && inspector.setAttributes.map((attrName) => {
        const setAttr = attribute as SetAttribute;
        return setAttr.attribute(attrName);
      })
    );
  }

  public inspect(): IEntityQueryFieldInspector {
    const inspect: IEntityQueryFieldInspector = {attribute: this.attribute.name};
    if (this.links) {
      inspect.links = this.links.map((link) => link.inspect());
    }
    if (this.setAttributes) {
      inspect.setAttributes = this.setAttributes.map((attr) => attr.name);
    }
    return inspect;
  }
}
