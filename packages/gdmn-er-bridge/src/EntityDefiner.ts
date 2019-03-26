import {AConnection, ATransaction, IParams} from "gdmn-db";
import {Entity, ERModel} from "gdmn-orm";
import {SQLTemplates} from "./crud/query/SQLTemplates";
import {Utils} from "./Utils";

interface IPK {
  field: string;
  value: any;
}

export class EntityDefiner {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;
  private readonly _erModel: ERModel;

  constructor(connection: AConnection, transaction: ATransaction, erModel: ERModel) {
    this._connection = connection;
    this._transaction = transaction;
    this._erModel = erModel;
  }

  public async defineEntity(entity: Entity, pkValues: any[]): Promise<Entity> {
    const baseEntity = entity.baseParent;

    const children0 = Object.values(this._erModel.entities).filter((e) => e.parent === baseEntity);
    const childWithSelector = children0.find((child) => !!Utils.getMainRelation(child).selector);
    if (childWithSelector) {
      const mainRelation = Utils.getMainRelation(childWithSelector);
      const pk = mainRelation.pk!.map((item, index) => ({
        field: item,
        value: pkValues[index]
      }));
      const selectorValue = await this._getSelectorValue(mainRelation.relationName, mainRelation.selector!.field, pk);

      const definedEntity = await this._deepFindChildBySelector(entity, selectorValue, pkValues);
      if (!definedEntity) {
        throw new Error("Entity is not defined");
      }
      return definedEntity;
    } else {
      const definedEntity = await this._deepFindChildByInheritance(entity, pkValues);
      if (!definedEntity) {
        throw new Error("Entity is not defined");
      }
      return definedEntity;
    }
  }

  private async _deepFindChildBySelector(entity: Entity,
                                         selectorValue: number | string,
                                         pkValues: any[]): Promise<Entity | undefined> {
    const children0 = Object.values(this._erModel.entities).filter((e) => e.parent === entity);

    for (const child of children0) {
      const definedEntity = await this._deepFindChildBySelector(child, selectorValue, pkValues);
      if (definedEntity) {
        return definedEntity;
      }
    }

    const mainRelation = Utils.getMainRelation(entity);
    if (mainRelation.selector) {
      if (mainRelation.selector.value === selectorValue) {
        const ownRelation = Utils.getOwnRelation(entity);
        const pk = ownRelation.pk!.map((item, index) => ({
          field: item,
          value: pkValues[index]
        }));
        if (await this._exists(ownRelation.relationName, pk)) {
          return entity;
        }
      }
    }
  }

  private async _deepFindChildByInheritance(entity: Entity, pkValues: any[]): Promise<Entity | undefined> {
    const children0 = Object.values(this._erModel.entities).filter((e) => e.parent === entity);

    for (const child of children0) {
      const definedEntity = await this._deepFindChildByInheritance(child, pkValues);
      if (definedEntity) {
        return definedEntity;
      }
    }

    const ownRelation = Utils.getOwnRelation(entity);
    const pk = ownRelation.pk!.map((item, index) => ({
      field: item,
      value: pkValues[index]
    }));
    if (await this._exists(ownRelation.relationName, pk)) {
      return entity;
    }
  }

  private async _getSelectorValue(relation: string,
                                  selectorField: string,
                                  pk: IPK[]): Promise<number | string> {
    const params: IParams = {};
    pk.forEach((item) => params[item.field] = item.value);

    let sql = `SELECT\n`;
    sql += SQLTemplates.field("", "", selectorField, true) + "\n";
    sql += SQLTemplates.from("", relation) + "\n";
    const conditions = Object.keys(params).map((field) => SQLTemplates.equals("", field, `:${field}`));
    sql += `WHERE ${conditions.join("\n  AND ")} \n`;
    console.log(sql, params);

    const result = await this._connection.executeReturning(this._transaction, sql, params);
    return result.getAny(selectorField);
  }

  private async _exists(relation: string, pk: IPK[]): Promise<boolean> {
    const params: IParams = {};
    pk.forEach((item) => params[item.field] = item.value);

    let sql = `SELECT\n`;
    sql += pk.map((item) => SQLTemplates.field("", "", item.field, true) + "\n");
    sql += SQLTemplates.from("", relation) + "\n";
    const conditions = Object.keys(params).map((field) => SQLTemplates.equals("", field, `:${field}`));
    sql += `WHERE ${conditions.join("\n  AND ")} \n`;
    console.log(sql, params);

    return await AConnection.executeQueryResultSet({
      connection: this._connection,
      transaction: this._transaction,
      sql,
      params,
      callback: (resultSet) => resultSet.next()
    });
  }
}
