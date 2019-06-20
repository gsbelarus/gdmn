import {
  Attribute,
  Entity,
  EntityInsert,
  EntityInsertField,
  EntityUpdateField,
  IRelation,
  ScalarAttribute,
  TEntityInsertFieldSet,
  TEntityUpdateFieldSet
} from "gdmn-orm";
import {AdapterUtils} from "../../AdapterUtils";
import {DomainResolver} from "../../ddl/builder/DomainResolver";
import {Constants} from "../../ddl/Constants";

export interface IParamsInsert {
  [paramName: string]: any;
}

export class Insert {

  private static readonly PARENT_ID = "ParentID";

  public readonly sql: string = "";
  public readonly params: IParamsInsert = {};
  public readonly fieldAliases = new Map<EntityInsertField, Map<Attribute, string>>();

  private readonly _insert: EntityInsert;
  private readonly _paramsBlock: IParamsInsert = {};

  constructor(insert: EntityInsert) {
    this._insert = insert;
    this.sql = this._getInsert();
  }

  private static _getPKFieldName(entity: Entity, relationName: string): string {
    if (entity.adapter) {
      const relation = entity.adapter.relation.find((rel) => rel.relationName === relationName);
      if (relation && relation.pk && relation.pk.length) {
        return relation.pk[0];
      }
    }
    const mainRelation = AdapterUtils.getMainRelation(entity);
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

  private _getInsert(): string {
    let sql = `EXECUTE BLOCK(${this._getParams()})\n` +
      `RETURNS (ID int, ${Insert.PARENT_ID} int)\n` +
      "AS\n" +
      "BEGIN\n";

    this._insert.entity.adapter!.relation.map(
      (rel) => {
        sql += `  INSERT INTO`;
        sql += ` ${rel.relationName}`;
        sql += `${this._makeFields(rel)}`;
        sql += ` VALUES${this._makeValues(rel)}`;
        sql += `${this._makeReturning(rel)}`;
      }
    );
    sql += `${this._getMappingTable()}`;

    sql += `SUSPEND;\n`;
    sql += `END`;
    return sql;
  }

  private _makeReturning(rel: IRelation): string {

    const mainRelation = AdapterUtils.getMainRelation(this._insert.entity);
    const ownRelation = AdapterUtils.getOwnRelationName(this._insert.entity);
    const PKFieldName = AdapterUtils.getPKFieldName(this._insert.entity, rel.relationName);

    if (mainRelation.relationName !== rel.relationName) {
      return `\n  RETURNING ${PKFieldName} INTO :ID;\n`; //INHERITEDKEY
    } else if (mainRelation.relationName === ownRelation) {
      return `\n  RETURNING ${PKFieldName} INTO :ID;\n`; //ID
    } else {
      return `\n  RETURNING ${PKFieldName} INTO :${Insert.PARENT_ID};\n\n`; //ID
    }
  }

  private _makeFields(rel: IRelation): string {
    const mainRelation = AdapterUtils.getMainRelation(this._insert.entity);

    const from = this._insert.fields
      .filter(field =>
        field.attribute.adapter!.relation == rel.relationName
        && !(field.attribute.type === "Set")
      )
      .map(field => {
        if (rel.selector && field.attribute.adapter!.field) {
          if (rel.selector.field === field.attribute.adapter!.field) {
            throw new Error(`Field ${field.attribute.adapter!.field} set automatically`);
          }
        }
        return field.attribute.adapter!.field;
      });
    if (mainRelation.relationName !== rel.relationName) {
      from.push(Insert._getPKFieldName(this._insert.entity, rel.relationName));
    }
    if (rel.selector) {
      from.push(rel.selector.field);
    }

    return from.length ? `(${from.join(", ")})\n ` : "\n  DEFAULT";
  }

  private _makeValues(rel: IRelation): string {
    const mainRelation = AdapterUtils.getMainRelation(this._insert.entity);

    const values = this._insert.fields
      .filter(field =>
        field.attribute.adapter!.relation == rel.relationName
        && !(field.attribute.type === "Set")
      )
      .map(field => {
        return this._addToParams(field.value);
      });

    if (mainRelation.relationName !== rel.relationName) {
      values.push(`:${Insert.PARENT_ID}`);
    }

    if (rel.selector) {
      values.push(this._addToParams(`${rel.selector.value}`));
    }

    return values.length ? `(${values.join(", ")})` : "";
  }

  private _getMappingTable(): string {

    return this._insert.fields
      .filter((field: EntityInsertField) => field.attribute.type === "Set")
      .map((field: EntityInsertField) => {
        const set = field.value as TEntityInsertFieldSet;
        const mainCrossRelationName = AdapterUtils.getMainCrossRelationName(field.attribute);
        return set.map((entry) => {
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
                `\n  VALUES(:ID, ${values.join(", ")});`;
            }).join("\n")+"\n";
          }
        ).join("\n");
      }).join("\n");

  }

  private _addToParams(value: any): string {
    const length = Object.keys(this.params).length;
    const placeholder = `P$${length + 1}`;
    this.params[placeholder] = value;
    return `:${placeholder}`;
  }

  private _addToParamsBlock(value: any, typeSQL?: string): string {
    const length = Object.keys(this._paramsBlock).length;
    const placeholder = `P$${length + 1}`;
    this._paramsBlock[placeholder] = value;
    return typeSQL ? `${placeholder} ${typeSQL} :${placeholder}` : `:${placeholder}`;
  }

  private _getParams(): string | undefined {

    let ParamText = "";

    const listParam = this._insert.fields
      .filter(field => field.attribute.type !== "Set")
      .map((field) => {
        return this._addToParamsBlock(field.value, DomainResolver._getType(field.attribute) + " =");
      });

    const relation = this._insert.entity.adapter!.relation.find((r) => (r.selector !== undefined));

    if (relation && relation.selector) {
      let typeSQL = "INTEGER =";
      const value = relation.selector.value;

      if (typeof value == "string") {
        typeSQL = `VARCHAR(${value.length}) =`;
      }

      listParam.push(this._addToParamsBlock(relation.selector.value, typeSQL));
    }
    this._insert.fields
      .filter((field: EntityUpdateField) => field.attribute.type === "Set")
      .map((field: EntityUpdateField) => {
        const set = field.value as TEntityUpdateFieldSet;

        return set.map((entry) => {
            return entry.pkValues.map((pk) => {
              listParam.push(`${this._addToParamsBlock(pk, "INTEGER =")}`);
              entry.setAttributes && entry.setAttributes.map((s) => {
                listParam.push(`${this._addToParamsBlock(s.value, DomainResolver._getType(s.attribute) + " =")}`);
              });
            });
          }
        );
      });

    ParamText += listParam.join(", ");
    return ParamText;
  }
}
