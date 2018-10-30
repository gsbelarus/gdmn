import {Attribute, Entity, EntityAttribute, EnumAttribute, ScalarAttribute, SetAttribute} from "gdmn-orm";
import {DDLHelper} from "../DDLHelper";

interface IATAttrOptions {
  relationName: string;
  fieldName: string;
  domainName: string;
  masterEntity?: Entity;
  crossTable?: string;
  crossTableKey?: number;
  crossField?: string;
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

  protected async nextDDLUnique(): Promise<number> {
    return await this.ddlHelper.cachedStatements.nextDDLUnique();
  }

  protected async _addATAttr(attr: Attribute, options: IATAttrOptions): Promise<void> {
    const fieldSourceKey = await this.ddlHelper.cachedStatements.addToATFields({
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

    await this.ddlHelper.cachedStatements.addToATRelationField({
      fieldName: options.fieldName,
      relationName: options.relationName,
      lName: attr.lName.ru && attr.lName.ru.name,
      description: attr.lName.ru && attr.lName.ru.fullName,
      attrName: attr.name,
      masterEntityName: options.masterEntity && options.masterEntity.name,
      fieldSource: options.domainName,
      fieldSourceKey,
      semCategory: attr.semCategories,
      crossTable: options.crossTable,
      crossTableKey: options.crossTableKey,
      crossField: options.crossField
    });
  }
}
