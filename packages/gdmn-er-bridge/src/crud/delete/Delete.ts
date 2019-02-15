import {EntityDelete} from "gdmn-orm";
import {Builder} from "../../ddl/builder/Builder";
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

  private _getDelete(query: EntityDelete): string {
    const {entity, pkValue} = query;

    let sql = `DELETE`;

    sql += `\n${this._makeFrom(query)}`;

    const mainRelationName = Builder._getMainRelation(entity);

    const PKFieldName = Builder._getPKFieldName(entity, mainRelationName.relationName);

    sql += `\nWHERE ${PKFieldName} = ${this._addToParams(pkValue)}`;

    return sql;
  }

  private _makeFrom(query: EntityDelete): string {
    const {entity} = query;
    return SQLTemplates.fromDelete(Builder._getMainRelation(entity).relationName);
  }

  private _addToParams(value: any): string {
    const length = Object.keys(this.params).length;
    const placeholder = `P$${length + 1}`;
    this.params[placeholder] = value;
    return `:${placeholder}`;
  }
}
