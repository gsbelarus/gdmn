import {Entity, EntityDelete, IRelation, ScalarAttribute} from "gdmn-orm";
import {SQLTemplates} from "../query/SQLTemplates";

export interface IParamsDelete {
  [paramName: string]: any;
}

export class Delete {

  public readonly sql: string = "";
  public readonly params: IParamsDelete = {};

  private readonly _query: EntityDelete;

  constructor(query: EntityDelete) {
    this._query = query;
    this.sql = this._getDelete(this._query);
  }

  private static _getMainRelationName(entity: Entity): IRelation {
    return entity.adapter!.relation[0];
  }

  private static _getOwnRelationName(entity: Entity): string {
    if (entity.adapter) {
      const relations = entity.adapter.relation.filter((rel) => !rel.weak);
      if (relations.length) {
        return relations[relations.length - 1].relationName;
      }
    }
    return entity.name;
  }

  private static _getPKFieldName(entity: Entity, relationName: string): string {

    if (entity.adapter) {
      const relation = entity.adapter.relation.find((rel) => rel.relationName === relationName);
      if (relation && relation.pk && relation.pk.length) {
        return relation.pk[0];
      }
    }
    const mainRelationName = Delete._getOwnRelationName(entity);
    if (mainRelationName === relationName) {
      const pkAttr = entity.pk[0];
      if (pkAttr instanceof ScalarAttribute || pkAttr.type === "Entity") {
        return pkAttr.adapter.field;
      }
    }
    if (entity.parent) {
      return this._getPKFieldName(entity.parent, relationName);
    }
    throw new Error(`Primary key is not found for ${relationName} relation`);
  }

  private _getDelete(query: EntityDelete): string {
    const {entity, pkValue} = query;

    let sql = `DELETE`;

    sql += `\n${this._makeFrom(query)}`;

    const mainRelationName = Delete._getMainRelationName(entity);

    const PKFieldName = Delete._getPKFieldName(entity, mainRelationName.relationName);

    sql += `\nWHERE ${PKFieldName} = ${this._addToParams(pkValue)}`;

    return sql;
  }

  private _makeFrom(query: EntityDelete): string {
    const {entity} = query;
    return SQLTemplates.fromDelete(Delete._getMainRelationName(entity).relationName);
  }

  private _addToParams(value: any): string {
    const length = Object.keys(this.params).length;
    const placeholder = `P$${length + 1}`;
    this.params[placeholder] = value;
    return `:${placeholder}`;
  }
}
