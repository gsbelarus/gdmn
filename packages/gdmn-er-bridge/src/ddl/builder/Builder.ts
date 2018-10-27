import {AConnection, ATransaction, TExecutor} from "gdmn-db";
import {semCategories2Str} from "gdmn-nlp";
import {Attribute, Entity, EntityAttribute, EnumAttribute, ScalarAttribute, SetAttribute} from "gdmn-orm";
import {DDLHelper} from "../DDLHelper";
import {ATHelper} from "./ATHelper";

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

export interface IBuilderOptions {
  ddlHelper: DDLHelper;
  atHelper: ATHelper;
}

export abstract class Builder {

  private readonly _atHelper: ATHelper;
  private _ddlHelper: DDLHelper | undefined;

  constructor(options?: IBuilderOptions) {
    if (options) {
      this._atHelper = options.atHelper;
      this._ddlHelper = options.ddlHelper;
    } else {
      this._atHelper = new ATHelper();
    }
  }

  get atHelper(): ATHelper {
    return this._atHelper;
  }

  get ddlHelper(): DDLHelper {
    if (this._ddlHelper) {
      return this._ddlHelper;
    }
    throw new Error("Need call prepare");
  }

  get prepared(): boolean {
    return this._atHelper.prepared;
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
    await this._atHelper.prepare(connection, transaction);
  }

  public async dispose(): Promise<void> {
    console.debug(this.ddlHelper.logs.join("\n"));
    await this.ddlHelper.dispose();
    await this._atHelper.dispose();
  }

  protected async nextDDLUnique(): Promise<number> {
    return await this.ddlHelper.cachedStatements.nextDDLUnique();
  }

  protected async _insertATEntity(entity: Entity, options: IATEntityOptions): Promise<number> {
    return await this._atHelper.insertATRelations({
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

    const fieldSourceKey = await this._atHelper.insertATFields({
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

    await this._atHelper.insertATRelationFields({
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
