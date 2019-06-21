import {Attribute, EntityUpdate, EntityUpdateField, IRelation, ScalarAttribute, TEntityUpdateFieldSet} from "gdmn-orm";
import {AdapterUtils} from "../../AdapterUtils";
import {DomainResolver} from "../../ddl/builder/DomainResolver";
import {Constants} from "../../ddl/Constants";
import {SQLTemplates} from "../query/SQLTemplates";

export interface IParamsUpdate {
  [paramName: string]: any;
}

export class Update {

  private static readonly PARENT_ID = "ParentID";
  private static readonly KEY1_VALUE = "Key1Value";

  public readonly sql: string = "";
  public readonly params: IParamsUpdate = {};
  public readonly fieldAliases = new Map<EntityUpdateField, Map<Attribute, string>>();

  private readonly _update: EntityUpdate;
  private readonly _paramsBlock: IParamsUpdate = {};

  constructor(update: EntityUpdate) {
    this._update = update;
    this.sql = this._getUpdate();
    this.params[Update.PARENT_ID] = update.pkValues[0];
  }

  private _makeWhere(rel: IRelation): string {
    const mainRelationName = AdapterUtils.getOwnRelationName(this._update.entity);
    const PKFieldName = AdapterUtils.getPKFieldName(this._update.entity, rel.relationName);
    const lineBreak = mainRelationName === rel.relationName ? "\n" : "\n";
    return `\n  WHERE ${PKFieldName} = :${Update.PARENT_ID};${lineBreak}`;
  }

  private _getUpdate(): string {
    let sql = `EXECUTE BLOCK(${this._getParamSetAttr()})\n` +
      "AS\n" +
      `DECLARE ${Update.KEY1_VALUE} INTEGER;\n` +
      "BEGIN";
    this._update.entity.adapter!.relation.map((rel) => {
      if (this._update.fields.filter((field) => field.attribute.adapter!.relation == rel.relationName).length) {
        sql += `\n  UPDATE`;
        sql += ` ${rel.relationName}`;
        sql += ` SET`;
        sql += `\n  ${this._makeFields(rel).join(", ")}`;
        sql += `${this._makeWhere(rel)}`;
      }
    });
    sql += `${this._getMappingTable()}`;
    sql += `END`;
    return sql;
  }

  private _makeFields(rel?: IRelation): string[] {
    return this._update.fields
      .filter((field) => field.attribute.adapter!.relation == rel!.relationName && field.attribute.type !== "Set")
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        return SQLTemplates.assign("", AdapterUtils.getFieldName(attribute), this._addToParams(field.value));
      });
  }

  private _addToParams(value: any): string {
    const length = Object.keys(this.params).length;
    const placeholder = `P$${length + 1}`;
    this.params[placeholder] = value;
    return `:${placeholder}`;
  }

  private _getMappingTable(): string {
    return this._update.fields
      .filter((field: EntityUpdateField) => field.attribute.type === "Set")
      .map((field: EntityUpdateField) => {
        const set = field.value as TEntityUpdateFieldSet;
        const mainCrossRelationName = AdapterUtils.getMainCrossRelationName(field.attribute);

        return "\n  DELETE\n" +
          `  FROM ${mainCrossRelationName}\n` +
          `  WHERE ${field.attribute.adapter.crossPk[0]} = :${Update.PARENT_ID};\n`
          + set.map((entry) => {
              const mainCross: string[] = [];

              return entry.pkValues.map((pk) => {
                const values: string[] = [];
                values.push(`${this._addToParams(pk)}`);

                entry.setAttributes && entry.setAttributes.map((s) => {
                  values.push(`${this._addToParams(s.value)}`);
                  mainCross.push(`${AdapterUtils.getFieldName(s.attribute)}`);
                });

                return `\n  INSERT INTO` +
                  ` ${mainCrossRelationName}(${field.attribute.adapter.crossPk[0]}, ` +
                  `${field.attribute.adapter.crossPk[1]}${mainCross.length ? ", " + mainCross.join(", ") : ""})` +
                  `\n  VALUES(:${Update.PARENT_ID}, ${values.join(", ")});`;
              }).join("\n")+"\n";
            }
          ).join("\n");
      }).join("\n");
  }

  private _getParamSetAttr(): string | undefined {
    const listParam = this._update.fields
      .filter((field: EntityUpdateField) => field.attribute.type !== "Set")
      .map((field: EntityUpdateField) => {
        return this._addToParamsBlock(field.value, DomainResolver._getType(field.attribute) + " =");
      });

    this._update.fields
      .filter((field: EntityUpdateField) => field.attribute.type === "Set")
      .map((field: EntityUpdateField) => {
        const set = field.value as TEntityUpdateFieldSet;
        let typeSQL = "INTEGER =";
        return set.map((entry) => {

            return entry.pkValues.map((pk) => {
              typeSQL = "INTEGER =";
              listParam.push(`${this._addToParamsBlock(pk, typeSQL)}`);

              entry.setAttributes && entry.setAttributes.map((s) => {

                if (typeof s.value === "string") {
                  typeSQL = `VARCHAR(${s.value.length}) =`;
                }
                listParam.push(`${this._addToParamsBlock(s.value, typeSQL)}`);
              });
            });
          }
        );
      });

    listParam.push(`${Update.PARENT_ID} INTEGER = :${Update.PARENT_ID}`);

    return listParam.join(", ");
  }

  private _addToParamsBlock(value: any, typeSQL?: string): string {
    const length = Object.keys(this._paramsBlock).length;
    const placeholder = `P$${length + 1}`;
    this._paramsBlock[placeholder] = value;
    return typeSQL ? `${placeholder} ${typeSQL} :${placeholder}` : `:${placeholder}`;
  }
}
