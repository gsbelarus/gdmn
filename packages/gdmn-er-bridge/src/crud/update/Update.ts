import {Attribute, EntityUpdate, EntityUpdateField, IRelation, ScalarAttribute, SetAttribute} from "gdmn-orm";
import {Builder} from "../../ddl/builder/Builder";
import {SQLTemplates} from "../query/SQLTemplates";

export interface IParamsUpdate {
  [paramName: string]: any;
}


export class Update {

  public readonly sql: string = "";
  public readonly params: IParamsUpdate = {};
  public readonly fieldAliases = new Map<EntityUpdateField, Map<Attribute, string>>();

  private readonly _update: EntityUpdate;
  private readonly _paramsBlock: IParamsUpdate = {};

  constructor(update: EntityUpdate) {
    this._update = update;
    this.sql = this._getUpdate(this._update);
    this.params["ParentID"] = update.pkValue;
  }

  private static _getFirstSetAttr(fields: EntityUpdateField[]): EntityUpdateField | undefined {
    return fields.find((l) => l.attribute.type === "Set");
  }

  private _makeWhere(query: EntityUpdate, rel: IRelation): string {
    const {entity} = query;

    const mainRelationName = Builder._getOwnRelationName(entity);
    const PKFieldName = Builder._getPKFieldName(entity, rel.relationName);
    const lineBreak = mainRelationName === rel.relationName ? "\n" : "\n";
    return `\n  WHERE ${PKFieldName} = :ParentID;${lineBreak}`;
  }

  private _checkFields(fields: EntityUpdateField[], rel: IRelation): number {

    const arrFields = fields
      .filter(field =>
        field.attribute.adapter!.relation == rel.relationName);

    return arrFields.length;
  }

  private _getUpdate(query: EntityUpdate): string {
    const {entity, fields} = query;
    let sql = `EXECUTE BLOCK(${this._getParamSetAttr(query)})\n` +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "BEGIN";
    entity.adapter!.relation.map(
      (rel) => {
        if (this._checkFields(fields, rel)) {
          sql += `\n  UPDATE`;
          sql += ` ${this._makeFrom(query, rel)}`;
          sql += ` SET`;
          sql += `\n  ${this._makeFields(fields, rel).join(", ")}`;
          sql += `${this._makeWhere(query, rel)}`;
        }
      });
    if (Update._getFirstSetAttr(fields)) {
      sql += `${this._getMappingTable(query)}`;
    }
    sql += `END`;
    return sql;
  }

  private _makeFrom(update: EntityUpdate, rel?: IRelation): string {
    const {entity} = update;
    const ownRelation = Builder._getOwnRelationName(entity);

    if (rel) {
      return SQLTemplates.fromUpdate(rel.relationName);
    }
    return SQLTemplates.fromUpdate(ownRelation);
  }

  private _makeFields(fields: EntityUpdateField[], rel?: IRelation): string[] {

    return fields
      .filter(field =>
        field.attribute.adapter!.relation == rel!.relationName
        && !(field.attribute.type === "Set")
      )
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        const value = field.value;
        return SQLTemplates.fieldUpdate(attribute.adapter!.field, this._addToParams(value));
      });
  }

  private _addToParams(value: any): string {
    const length = Object.keys(this.params).length;
    const placeholder = `P$${length + 1}`;
    this.params[placeholder] = value;
    return `:${placeholder}`;
  }

  private _getMappingTable(query: EntityUpdate): string {
    const {entity, fields, pkValue} = query;
    const _getFirstSetAttr = Update._getFirstSetAttr(fields);

    const attribute = _getFirstSetAttr!.attribute as SetAttribute;

    const MainCrossRelationName = Builder._getMainCrossRelationName(attribute);

    const values = _getFirstSetAttr!.value;

    const sqlMappingtable = values.map((v: any) => {
        if (typeof v === "object") {
          const param = Object.values(v);
          const MainCross = param
            .filter((p) => typeof p === "object")
            .map((p) => {
                if (typeof p === "number") {
                  return `${SQLTemplates.valueInsert(this._addToParams(p.toString()))}`;
                } else {
                  return Object.values(p).map(x => {
                    return x.attribute + " = " + `${SQLTemplates.valueInsert(this._addToParams(x.value))}`;
                  });
                }
              }
            );
          return `\n  UPDATE` +
            ` ${MainCrossRelationName} SET` +
            `\n  ${MainCross.join(", ")}` +
            `\n  WHERE KEY1 = :ParentID;\n`;
        }
      }
    );

    return sqlMappingtable.join("");
  }

  private _getParamSetAttr(query: EntityUpdate): string | undefined {
    const {fields} = query;

    const listParam = fields
      .filter(field => field.attribute.type !== "Set")
      .map((field) => {

        let typeSQL = "INTEGER =";
        const value = field.value;

        if (typeof value == "string") {
          typeSQL = `VARCHAR(${value.length}) =`;
        }
        return SQLTemplates.valueInsert(this._addToParamsBlock(value, typeSQL));
      });

    fields
      .filter(field => field.attribute.type === "Set")
      .map((field) => {
        const value = field.value;
        let typeSQL = "INTEGER =";
        if (typeof value == "object") {
          value.map((v: any) => {
            if (typeof v == "number") {
              listParam.push(SQLTemplates.valueInsert(this._addToParamsBlock(v, typeSQL)));
            }
            const param = Object.values(v);
            param
              .filter((p) => typeof p === "object")
              .map((p) => {
                  if (typeof p === "number") {
                    typeSQL = "INTEGER =";
                    listParam.push(SQLTemplates.valueInsert(this._addToParamsBlock(p, typeSQL)));
                  } else {
                    return Object.entries(p).map((x) => {

                      listParam.push(SQLTemplates.valueInsert(this._addToParamsBlock(x, typeSQL)));
                    });
                  }
                }
              );
          });
        }
      });

    listParam.push("ParentID INTEGER = :ParentID");

    return listParam.join(", ");
  }

  private _addToParamsBlock(value: any, typeSQL?: string): string {
    const length = Object.keys(this._paramsBlock).length;
    const placeholder = `P$${length + 1}`;
    this._paramsBlock[placeholder] = value;
    return typeSQL ? `${placeholder} ${typeSQL} :${placeholder}` : `:${placeholder}`;
  }
}
