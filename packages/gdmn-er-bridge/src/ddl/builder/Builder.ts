import {Attribute, Entity, EntityAttribute, EnumAttribute, IRelation, ScalarAttribute, SetAttribute} from "gdmn-orm";
import {Constants} from "../Constants";
import {DDLHelper} from "../DDLHelper";

interface IATAttrOptions {
  relationName: string;
  fieldName: string;
  domainName: string;
  masterEntity?: Entity;
  crossTable?: string;
  crossField?: string;
  lsHortName?: string;
}

export abstract class Builder {

  private readonly _ddlHelper: DDLHelper;

  constructor(ddlHelper: DDLHelper) {
    this._ddlHelper = ddlHelper;
  }

  get ddlHelper(): DDLHelper {
    return this._ddlHelper;
  }

  public static _getOwnRelationName(entity: Entity): string {
    if (entity.adapter) {
      const relations = entity.adapter.relation.filter((rel) => !rel.weak);
      if (relations.length) {
        return relations[relations.length - 1].relationName;
      }
    }
    return entity.name;
  }

  public static _getFieldName(attr: Attribute): string {
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

  public static _getPKFieldName(entity: Entity, relationName: string): string {
    if (entity.adapter) {
      const relation = entity.adapter.relation.find((rel) => rel.relationName === relationName);
      if (relation && relation.pk && relation.pk.length) {
        return relation.pk[0];
      }
    }
    const mainRelation = Builder._getMainRelation(entity);
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

  public static _getMainRelation(entity: Entity): IRelation {
    return entity.adapter!.relation[0];
  }

  public static _getMainCrossRelationName(attribute: Attribute): [] {
    return attribute.adapter!.crossRelation;
  }

  protected async nextDDLUnique(): Promise<number> {
    return await this.ddlHelper.cachedStatements.nextDDLUnique();
  }

  protected async _updateATAttr(attr: Attribute, options: IATAttrOptions): Promise<void> {
    await this.ddlHelper.cachedStatements.updateATFields({
      fieldName: options.domainName,
      lName: attr.lName.ru && attr.lName.ru.name,
      description: attr.lName.ru && attr.lName.ru.fullName,
      numeration: attr.type === "Enum"
        ? (attr as EnumAttribute).values.map(({value, lName}) => ({
          key: value,
          value: lName && lName.ru ? lName.ru.name : ""
        }))
        : undefined
    });

    await this.ddlHelper.cachedStatements.updateATRelationField({
      fieldName: options.fieldName,
      relationName: options.relationName,
      lName: attr.lName.ru && attr.lName.ru.name,
      description: attr.lName.ru && attr.lName.ru.fullName,
      attrName: attr.name,
      masterEntityName: options.masterEntity && options.masterEntity.name,
      fieldSource: options.domainName,
      semCategory: attr.semCategories,
      crossTable: options.crossTable,
      crossField: options.crossField
    });
  }
}
