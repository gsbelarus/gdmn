import {ScalarAttribute, SetAttribute} from "..";
import {Attribute} from "../model/Attribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityLink, IEntityLinkInspector} from "./EntityLink";

export interface IEntityQueryFieldInspector {
  attribute: string;
  setAttributes?: string[];
  link?: IEntityLinkInspector;
}

export class EntityQueryField {

  public attribute: Attribute;
  public link?: EntityLink;
  public setAttributes?: ScalarAttribute[];

  constructor(attribute: Attribute, link?: EntityLink, setAttributes?: ScalarAttribute[]) {
    this.attribute = attribute;
    this.link = link;
    this.setAttributes = setAttributes;
  }

  public static inspectorToObject(erModel: ERModel,
                                  entity: Entity,
                                  inspector: IEntityQueryFieldInspector): EntityQueryField {
    const attribute = entity.attribute(inspector.attribute);
    return new EntityQueryField(
      attribute,
      inspector.link && EntityLink.inspectorToObject(erModel, inspector.link),
      inspector.setAttributes && inspector.setAttributes.map((attrName) => {
        const setAttr = attribute as SetAttribute;
        return setAttr.attribute(attrName);
      })
    );
  }

  public inspect(): IEntityQueryFieldInspector {
    const inspect: IEntityQueryFieldInspector = {attribute: this.attribute.name};
    if (this.link) {
      inspect.link = this.link.inspect();
    }
    if (this.setAttributes) {
      inspect.setAttributes = this.setAttributes.map((attr) => attr.name);
    }
    return inspect;
  }
}
