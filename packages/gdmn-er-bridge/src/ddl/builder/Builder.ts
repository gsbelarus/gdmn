import {AConnection, ATransaction, TExecutor} from "gdmn-db";
import {semCategories2Str} from "gdmn-nlp";
import {
  Attribute,
  Entity,
  EntityAttribute,
  EnumAttribute,
  ScalarAttribute,
  SetAttribute
} from "gdmn-orm";
import {ATHelper} from "./ATHelper";
import {DDLHelper} from "./DDLHelper";

interface IATEntityOptions {
  relationName: string;
}

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

  private _ddlHelper: DDLHelper | undefined;
  private _atHelper: ATHelper | undefined;

  constructor();
  constructor(ddlHelper: DDLHelper, atHelper: ATHelper);
  constructor(ddlHelper?: DDLHelper, atHelper?: ATHelper) {
    this._ddlHelper = ddlHelper;
    this._atHelper = atHelper;
    if ((ddlHelper || atHelper) && !this.prepared) {
      throw new Error("ddlHelper or atHelper are not prepared");
    }
  }

  get prepared(): boolean {
    return !!this._ddlHelper && this._ddlHelper.prepared && !!this._atHelper && this._atHelper.prepared;
  }

  public static async executeSelf<T extends Builder, R>(connection: AConnection,
                                                        transaction: ATransaction,
                                                        selfReceiver: TExecutor<null, T>,
                                                        callback: TExecutor<T, R>): Promise<R> {
    let self: undefined | T;
    try {
      self = await selfReceiver(null);
      await self.prepare(connection, transaction);
      return await callback(self);
    } finally {
      if (self && self.prepared) {
        await self.dispose();
      }
    }
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
    if (SetAttribute.isType(attr)) {
      if (attr.adapter && attr.adapter.presentationField) return attr.adapter.presentationField;
    } else if (EntityAttribute.isType(attr) || ScalarAttribute.isType(attr)) {
      if (attr.adapter) return attr.adapter.field;
    }
    return attr.name;
  }

  public async prepare(connection: AConnection, transaction: ATransaction): Promise<void> {
    this._ddlHelper = new DDLHelper(connection, transaction);
    this._atHelper = new ATHelper(connection, transaction);
    await this._getDDLHelper().prepare();
    await this._getATHelper().prepare();
  }

  public async dispose(): Promise<void> {
    console.debug(this._getDDLHelper().logs.join("\n"));
    await this._getDDLHelper().dispose();
    await this._getATHelper().dispose();
    this._ddlHelper = undefined;
    this._atHelper = undefined;
  }

  protected _getDDLHelper(): DDLHelper {
    if (this._ddlHelper) {
      return this._ddlHelper;
    }
    throw new Error("Need call prepare");
  }

  protected _getATHelper(): ATHelper {
    if (this._atHelper) {
      return this._atHelper;
    }
    throw new Error("Need call prepare");
  }

  protected async _insertATEntity(entity: Entity, options: IATEntityOptions): Promise<number> {
    return await this._getATHelper().insertATRelations({
      relationName: options.relationName,
      relationType: "T",
      lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
      description: entity.lName.ru ? entity.lName.ru.fullName : entity.name,
      entityName: options.relationName !== entity.name ? entity.name : undefined,
      semCategory: semCategories2Str(entity.semCategories)
    });
  }

  protected async _insertATAttr(attr: Attribute, options: IATAttrOptions): Promise<void> {
    const numeration = EnumAttribute.isType(attr)
      ? attr.values.map(({value, lName}) => `${value}=${lName && lName.ru ? lName.ru.name : ""}`).join("#13#10")
      : undefined;

    const fieldSourceKey = await this._getATHelper().insertATFields({
      fieldName: options.domainName,
      lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
      description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
      refTable: undefined,
      refCondition: undefined,
      setTable: undefined,
      setListField: undefined,
      setCondition: undefined,
      numeration: numeration ? Buffer.from(numeration) : undefined
    });

    await this._getATHelper().insertATRelationFields({
      fieldName: options.fieldName,
      relationName: options.relationName,
      lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
      description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
      attrName: options.fieldName !== attr.name ? attr.name : undefined,
      masterEntityName: options.masterEntity ? options.masterEntity.name : undefined,
      fieldSource: options.domainName,
      fieldSourceKey,
      semCategory: semCategories2Str(attr.semCategories),
      crossTable: options.crossTable,
      crossTableKey: options.crossTableKey,
      crossField: options.crossField
    });
  }
}
