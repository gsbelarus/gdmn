import {Attribute, Entity, EntityAttribute, IRelation, ScalarAttribute, SetAttribute} from "gdmn-orm";
import {Constants} from "./ddl/Constants";

export class AdapterUtils {

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
    return Constants.DEFAULT_ID_NAME;
  }

  public static getMainRelation(entity: Entity): IRelation {
    return entity.adapter!.relation[0];
  }

  public static getMainRelationName(entity: Entity): string {
    if (entity.adapter) {
      if (entity.adapter.relation.length) {
        return entity.adapter.relation[0].relationName;
      }
    }
    return entity.name;
  }

  public static getOwnRelation(entity: Entity): IRelation {
    const relations = entity.adapter!.relation.filter((rel) => !rel.weak);
    return relations[relations.length - 1];
  }

  public static getOwnRelationName(entity: Entity): string {
    if (entity.adapter) {
      const relations = entity.adapter.relation.filter((rel) => !rel.weak);
      if (relations.length) {
        return relations[relations.length - 1].relationName;
      }
    }
    return entity.name;
  }

  public static getMainCrossRelationName(attribute: Attribute): [] {
    return attribute.adapter!.crossRelation;
  }

  public static getPK4Adapter(pk: string[]): string[] | undefined {
    if (!pk.length) {
      return;
    }
    if (pk.length === 1 && pk.includes(Constants.DEFAULT_ID_NAME)) {
      return;
    }
    return pk;
  }
}
