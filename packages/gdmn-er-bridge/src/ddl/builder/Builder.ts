import {Attribute, Entity, EnumAttribute} from "gdmn-orm";
import {DDLHelper} from "../DDLHelper";

interface IATAttrOptions {
  relationName: string;
  fieldName: string;
  domainName: string;
  masterEntity?: Entity;
  crossTable?: string;
  crossField?: string;
  setTable?: string; 
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

  protected async nextDDLUnique(): Promise<number> {
    return await this.ddlHelper.cachedStatements.nextDDLUnique();
  }

  protected async nextDDLTriggercross(): Promise<number> {
    return await this.ddlHelper.cachedStatements.nextDDLTriggercross();
  }

  protected async DDLdbID(): Promise<number> {
    return await this.ddlHelper.cachedStatements.DDLdbID();
  }

  protected async _updateATAttr(attr: Attribute, options: IATAttrOptions): Promise<void> {
    await this.ddlHelper.cachedStatements.updateATFields({
      fieldName: options.domainName,
      lName: attr.lName.ru && attr.lName.ru.name,
      description: attr.lName.ru && attr.lName.ru.fullName,
      setTable: options.setTable,
      setListField: options.crossField,
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
