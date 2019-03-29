import {Attribute, Entity, EntityInsert, EntityInsertField, IRelation, ScalarAttribute, SetAttribute} from "gdmn-orm";
import {Constants} from "../../ddl/Constants";
import {AdapterUtils} from "../../AdapterUtils";

export interface IParamsInsert {
  [paramName: string]: any;
}

export class Insert {

  public readonly sql: string = "";
  public readonly params: IParamsInsert = {};
  public readonly fieldAliases = new Map<EntityInsertField, Map<Attribute, string>>();

  private readonly _query: EntityInsert;
  private readonly _paramsBlock: IParamsInsert = {};

  constructor(query: EntityInsert) {
    this._query = query;
    this.sql = this._getInsert(this._query);
  }

  private static _getMainCrossPk(attribute: Attribute): string {
    return attribute.adapter!.crossPk.join(", ");
  }

  private static _getFirstSetAttr(fields: EntityInsertField[]): EntityInsertField | undefined {
    return fields.find((l) => l.attribute.type === "Set");
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

  private _getInsert(query: EntityInsert): string {
    const {entity, fields} = query;

    let sql = `EXECUTE BLOCK(${this._getParamSetAttr(entity, fields)})\n` +
      "AS\n" +
      "DECLARE Key1Value INTEGER;\n" +
      "DECLARE ParentID INTEGER;\n" +
      "BEGIN\n";

    entity.adapter!.relation.map(
      (rel) => {
        sql += `  INSERT INTO`;
        sql += ` ${this._makeFrom(query, rel)}`;
        sql += `${this._makeFields(query, rel)}`;
        sql += ` VALUES${this._makeValues(query, rel)}`;
        sql += `${this._makeReturning(query, rel)}`;
      }
    );

    if (Insert._getFirstSetAttr(fields)) {
      sql += `${this._getMappingTable(query)}`;
    }
    sql += `END`;
    return sql;
  }

  private _makeFrom(query: EntityInsert, rel: IRelation): string {
    return rel.relationName;
  }

  private _makeReturning(query: EntityInsert, rel: IRelation): string {
    const {entity} = query;

    const mainRelation = AdapterUtils.getMainRelation(entity);
    const ownRelation = AdapterUtils.getOwnRelationName(entity);
    const PKFieldName = AdapterUtils.getPKFieldName(entity, rel.relationName);

    if (mainRelation.relationName !== rel.relationName) {
      return `\n  RETURNING ${PKFieldName} INTO :Key1Value;\n`; //INHERITEDKEY
    } else if (mainRelation.relationName === ownRelation) {
      return `\n  RETURNING ${PKFieldName} INTO :Key1Value;\n`; //ID
    } else {
      return `\n  RETURNING ${PKFieldName} INTO :ParentID;\n\n`; //ID
    }
  }

  private _makeFields(query: EntityInsert, rel: IRelation): string {
    const {entity, fields} = query;
    const mainRelation = AdapterUtils.getMainRelation(entity);

    const from = fields
      .filter(field =>
        field.attribute.adapter!.relation == rel.relationName
        && !(field.attribute.type === "Set")
      )
      .map(field => {
        if(rel.selector && field.attribute.adapter!.field) {
          if(rel.selector.field === field.attribute.adapter!.field) {
            throw new Error(`Field ${field.attribute.adapter!.field} set automatically`);
          }
        }
        return field.attribute.adapter!.field;
      });
    if (mainRelation.relationName !== rel.relationName) {
      from.push(Insert._getPKFieldName(entity, rel.relationName));
    }
    if (rel.selector) {
      from.push(rel.selector.field);
    }

    return from.length ? `(${from.join(", ")})\n ` : "\n  DEFAULT";
  }

  private _makeValues(query: EntityInsert, rel: IRelation): string {
    const {entity, fields} = query;
    const mainRelation = AdapterUtils.getMainRelation(entity);

    const values = fields
      .filter(field =>
        field.attribute.adapter!.relation == rel.relationName
        && !(field.attribute.type === "Set")
      )
      .map(field => {
        return this._addToParams(field.value);
      });

    if (mainRelation.relationName !== rel.relationName) {
      values.push(":ParentID");
    }

    if (rel.selector) {
      values.push(this._addToParams(`${rel.selector.value}`));
    }

    return values.length ? `(${values.join(", ")})` : "";
  }

  private _getMappingTable(query: EntityInsert): string {
    const {fields} = query;
    const _getFirstSetAttr = Insert._getFirstSetAttr(fields);
    const attribute = _getFirstSetAttr!.attribute as SetAttribute;
    const MainCrossRelationName = AdapterUtils.getMainCrossRelationName(attribute);

    let MainCrossPk = Insert._getMainCrossPk(attribute);

    const values = _getFirstSetAttr!.value;

    const sqlMappingtable = values.map((v: any) => {
        if (typeof v === "object") {
          let MainCross = MainCrossPk;
          const param = Object.values(v);
          let val = "";

          param.map(p => {
              if (typeof p === "number") {
                val = `${this._addToParams(p.toString())}`;
              } else {
                Object.values(p).map(x => {
                  val += ", " + `${this._addToParams(x.value)}`;
                  MainCross += ", " + x.attribute;
                });
              }
            }
          );
          return `\n  INSERT INTO` +
            ` ${MainCrossRelationName}` +
            `(${MainCross})\n` +
            `  VALUES(:Key1Value, ${val});\n`;

        } else if (typeof v === "number") {
          return `\n  INSERT INTO` +
            ` ${MainCrossRelationName}` +
            `(${MainCrossPk})\n` +
            `  VALUES(:Key1Value, ${this._addToParams(v)});\n`;
        }
      }
    );

    return sqlMappingtable.join("");
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

  private _getParamSetAttr(entity: Entity, fields: EntityInsertField[]): string | undefined {

    let ParamText = "";

    const listParam = fields
      .filter(field => field.attribute.type !== "Set")
      .map((field) => {
        let typeSQL = "INTEGER =";
        const value = field.value;

        if (typeof value == "string") {
          typeSQL = `VARCHAR(${value.length}) =`;
        }
        return this._addToParamsBlock(value, typeSQL);
      });

   const relation = entity.adapter!.relation.find((r) => r.selector !== undefined);

   if (relation && relation.selector) {
     let typeSQL = "INTEGER =";
     const value = relation.selector.value;

     if (typeof value == "string") {
       typeSQL = `VARCHAR(${value.length}) =`;
     }

     listParam.push(this._addToParamsBlock(relation.selector.value, typeSQL));
   }
    fields
      .filter(field => field.attribute.type === "Set")
      .map((field) => {
        const value = field.value;
        let typeSQL = "INTEGER =";

        if (typeof value == "object") {
          value.map((v: any) => {
            if (typeof v == "number") {
              listParam.push(this._addToParamsBlock(v, typeSQL));
            }
            const param = Object.values(v);
            param.map(p => {
                if (typeof p === "number") {
                  typeSQL = "INTEGER =";
                  listParam.push(this._addToParamsBlock(p, typeSQL));
                } else {
                  return Object.entries(p).map((x) => {
                    listParam.push(this._addToParamsBlock(x, typeSQL));
                  });
                }
              }
            );
          });
        }
      });

    ParamText += listParam.join(", ");
    return ParamText;
  }
}
