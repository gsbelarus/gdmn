import {Attribute, Entity, EntityAttribute, IRelation, ScalarAttribute, SetAttribute} from "gdmn-orm";
import {Constants} from "./Constants";

export class Utils {

  public static getOwnRelationName(entity: Entity): string {
    if (entity.adapter) {
      const relations = entity.adapter.relation.filter((rel) => !rel.weak);
      if (relations.length) {
        return relations[relations.length - 1].relationName;
      }
    }
    return entity.name;
  }

  public static getFieldName(attr: Attribute): string {
    if (attr.type === "Set") {
      const setAttr = attr as SetAttribute;
      if (setAttr.adapter && setAttr.adapter.presentationField) {
        return setAttr.adapter.presentationField;
      }
    } else if (attr instanceof EntityAttribute || attr instanceof ScalarAttribute) {
      if (attr.adapter) return attr.adapter.field;
    }
    return attr.name;
  }

  public static getPKFieldName(entity: Entity, relationName: string): string {
    if (entity.adapter) {
      const relation = entity.adapter.relation.find((rel) => rel.relationName === relationName);
      if (relation && relation.pk && relation.pk.length) {
        return relation.pk[0];
      }
    }
    const mainRelation = Utils.getMainRelation(entity);
    if (mainRelation.relationName === relationName) {
      const pkAttr = entity.pk[0];
      if (pkAttr instanceof ScalarAttribute || pkAttr.type === "Entity") {
        return pkAttr.adapter.field;
      }
    }
    if (entity.parent) {
      return Constants.DEFAULT_INHERITED_KEY_NAME;
    }
    throw new Error(`Primary key is not found for ${relationName} relation`);
  }

  public static getMainRelation(entity: Entity): IRelation {
    return entity.adapter!.relation[0];
  }

  public static getMainCrossRelationName(attribute: Attribute): [] {
    return attribute.adapter!.crossRelation;
  }
}
