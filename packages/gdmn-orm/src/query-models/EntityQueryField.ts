import {Attribute} from "../model/Attribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {SetAttribute} from "../model/link/SetAttribute";
import {EntityAttribute} from "../model/link/EntityAttribute";
import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityLink, IEntityLinkInspector} from "./EntityLink";

export interface IEntityQueryFieldInspector {
  attribute: string;
  setAttributes?: string[];
  link?: IEntityLinkInspector;
}

export class EntityQueryField {

  public readonly attribute: Attribute;
  public readonly link?: EntityLink;
  public readonly setAttributes?: ScalarAttribute[];

  constructor(attribute: Attribute, link?: EntityLink, setAttributes?: ScalarAttribute[]) {
    this.attribute = attribute;
    if (attribute instanceof EntityAttribute) {
      if (!link) {
        throw new Error("EntityQueryField with EntityAttribute must has 'link' property");
      }
    }
    if (attribute instanceof ScalarAttribute) {
      if (link) {
        throw new Error("EntityQueryField with ScalarAttribute must hasn't 'link' property");
      }
      if (setAttributes) {
        throw new Error("EntityQueryField with ScalarAttribute must hasn't 'setAttributes' property");
      }
    }
    this.link = link;
    this.setAttributes = setAttributes;
  }

  public static inspectorToObject(erModel: ERModel,
                                  entity: Entity,
                                  inspector: IEntityQueryFieldInspector): EntityQueryField {
    const attribute = entity.attribute(inspector.attribute);
    if (attribute instanceof EntityAttribute) {
      if (!inspector.link) {
        throw new Error("EntityQueryField with EntityAttribute must has 'link' property")
      }
      if (attribute instanceof SetAttribute) {
        return new EntityQueryField(attribute, EntityLink.inspectorToObject(erModel, inspector.link),
          inspector.setAttributes && inspector.setAttributes.map((attrName) => {
            const setAttr = attribute as SetAttribute;
            return setAttr.attribute(attrName);
          })
        );
      }
      return new EntityQueryField(attribute, EntityLink.inspectorToObject(erModel, inspector.link));
    }
    if (attribute instanceof ScalarAttribute) {
      if (inspector.link) {
        throw new Error("EntityQueryField with ScalarAttribute must hasn't 'link' property");
      }
      if (inspector.setAttributes) {
        throw new Error("EntityQueryField with ScalarAttribute must hasn't 'setAttributes' property");
      }
      return new EntityQueryField(attribute);
    }
    throw new Error("Should never happened")
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
