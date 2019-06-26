import {
  Attribute,
  EntityAttribute,
  EntityLink,
  EntityLinkField,
  IEntityQueryAlias,
  IRelation,
  ScalarAttribute,
  SetAttribute,
  EntityQuerySet, IEntityQuerySetWhere
} from "gdmn-orm";
import {IParams} from "../..";
import {AdapterUtils} from "../../AdapterUtils";
import {Constants} from "../../ddl/Constants";
import {SQLTemplates} from "./SQLTemplates";

export interface IParams {
  [paramName: string]: any;
}

export class SelectSet {

  public readonly query: EntityQuerySet;
  public readonly sql: string = "";
  public readonly params: IParams = {};
  public readonly fieldAliases = new Map<EntityLinkField, Map<Attribute, string>>();

  private readonly _linkAliases = new Map<EntityLink, { [relationName: string]: string }>();

  constructor(query: EntityQuerySet) {
    this.query = query;
    this.sql = this._getSelect(this.query, true);
  }

  private static _arrayJoinWithBracket(array: string[], separator: string): string {
    if (array.length === 1) {
      return array.join(separator);
    } else if (array.length > 1) {
      return `(${array.join(separator)})`;
    }
    return "";
  }

  private _findSetField(query: EntityQuerySet):EntityLinkField | undefined {
    return query.link.fields.find((field) => field.attribute.type === "Set")
  }

  private _getSelect(query: EntityQuerySet, first?: boolean, withoutAlias?: boolean, existsLink?: EntityLink): string {
    const {options, link} = query;

    let sql = `SELECT`;

    sql += `\n${this._makeFields(link, withoutAlias).join(",\n")}`;
    sql += `\n${this._makeFrom(query, first)}`;

    const sqlJoin = this._makeJoin(link).join("\n");
    if (sqlJoin) {
      sql += `\n${sqlJoin}`;
    }

    const sqlWhere = this._makeWhereLinkConditions(link)
      .concat(this._makeWhereConditions(query, options && options.where, existsLink))
      .join("\n  AND ");
    if (sqlWhere) {
      sql += `\nWHERE ${sqlWhere}`;
    }
    return sql;
  }

  private _makeFields(link: EntityLink, withoutAlias?: boolean): string[] {
    const fields = link.fields
      .filter((field) => !field.links)
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        const tableAlias = this._getTableAlias(link, attribute.adapter!.relation);
        const fieldAlias = withoutAlias ? "" : this._getFieldAlias(field);
        return SQLTemplates.field(tableAlias, fieldAlias, attribute.adapter!.field);
      });

    const joinedFields = link.fields.reduce((items, field) => {
      if (field.links) {
        if (field.setAttributes) {
          const attribute = field.attribute as SetAttribute;
          const crossFields = field.setAttributes.map((setAttr) => {
            return SQLTemplates.field(
              this._getTableAlias(link, attribute.adapter!.crossRelation),
              this._getFieldAlias(field, setAttr),
              setAttr.adapter!.field
            );
          });
          items = items.concat(crossFields);
        }
        for (const fLink of field.links) {
          items = items.concat(this._makeFields(fLink));
        }
        return items;
      }
      return items;
    }, [] as string[]);

    return fields.concat(joinedFields);
  }

  private _makeFrom(query: EntityQuerySet, first?: boolean): string {
    const {link} = query;
    const findSetField =  this._findSetField(query);

    return SQLTemplates.from(this._getTableAlias(
        link,
        findSetField!.attribute.adapter!.crossRelation),
        findSetField!.attribute.adapter!.crossRelation);
  }

  private _makeJoin(link: EntityLink): string[] {
    const existsRelations = this._getExistsRelations(link);
    if (!existsRelations.length) {
      existsRelations.push(link.entity.adapter!.relation[0]);
    }
    const firstRelationName = existsRelations[0].relationName;
    const firstPKFieldName = AdapterUtils.getPKFieldName(link.entity, firstRelationName);

    return link.fields.reduce((joins, field) => {
      if (field.links) {
        for (const fLink of field.links) {
          const linkExistsRelations = this._getExistsRelations(fLink);
          if (!linkExistsRelations.length) {
            linkExistsRelations.push(fLink.entity.adapter!.relation[0]);
          }
          const linkFirstRelationName = linkExistsRelations[0].relationName;
          const linkFirstPKFieldName = AdapterUtils.getPKFieldName(fLink.entity, linkFirstRelationName);

          switch (field.attribute.type) {
            case "Parent": {
              const attr = field.attribute as EntityAttribute;
              if (fLink.options && fLink.options.hasRoot) {
                joins.push(
                  SQLTemplates.joinWithTree(
                    attr.adapter!.relation,
                    this._getTableAlias(fLink, attr.adapter!.relation),
                    Constants.DEFAULT_LB_NAME,
                    this._getTableAlias(link, attr.adapter!.relation),
                    Constants.DEFAULT_RB_NAME
                  )
                );
              }
              if (linkFirstRelationName !== attr.adapter!.relation || !(fLink.options
                && fLink.options.hasRoot) && link.entity.isIntervalTree) {
                joins.push(
                  SQLTemplates.join(
                    linkFirstRelationName,
                    this._getTableAlias(fLink, linkFirstRelationName),
                    linkFirstPKFieldName,
                    this._getTableAlias(link, attr.adapter!.relation),
                    attr.adapter!.field,
                    "LEFT"
                  )
                );
              }
              break;
            }
            case "Set": {
              const attr = field.attribute as SetAttribute;
              joins.push(
                SQLTemplates.join(
                  linkFirstRelationName,
                  this._getTableAlias(fLink, linkFirstRelationName),
                  linkFirstPKFieldName,
                  this._getTableAlias(link, attr.adapter!.crossRelation),
                  attr.adapter!.crossPk[1],
                  "LEFT"
                )
              );
              break;
            }
            case "Entity":
            default: {

              const attr = field.attribute as EntityAttribute;
              joins.push(
                SQLTemplates.join(
                  linkFirstRelationName,
                  this._getTableAlias(fLink, linkFirstRelationName),
                  linkFirstPKFieldName,
                  this._getTableAlias(link, attr.adapter!.relation),
                  attr.adapter!.field,
                  "LEFT"
                )
              );
            }
          }
          linkExistsRelations.reduce((relJoins, rel) => {
            if (fLink && linkFirstRelationName !== rel.relationName) {
              relJoins.push(SQLTemplates.join(
                rel.relationName,
                this._getTableAlias(fLink, rel.relationName),
                AdapterUtils.getPKFieldName(fLink.entity, rel.relationName),
                this._getTableAlias(fLink, linkFirstRelationName),
                AdapterUtils.getPKFieldName(fLink.entity, linkFirstRelationName),
                "LEFT"
              ));
            }
            return relJoins;
          }, joins);
          joins = joins.concat(this._makeJoin(fLink));
        }
        return joins;
      }
      return joins;
    }, [] as string[]);
  }

  private _makeWhereLinkConditions(link: EntityLink): string[] {
    const whereEquals = link.entity.adapter!.relation
      .filter((rel) => this._isExistsInLink(link, rel.relationName))
      .reduce((equals, rel) => {
        if (rel.selector) {
          equals.push(
            SQLTemplates.equals(
              this._getTableAlias(link, rel.relationName),
              rel.selector.field,
              this._addToParams(rel.selector.value)
            )
          );
        }
        return equals;
      }, [] as string[]);

    return link.fields.reduce((equals, _field) => { // FIXME ???
      // if (field.link) {
      //   return equals.concat(this._makeWhereLinkConditions(field.link));
      // }
      return equals;
    }, whereEquals);
  }

  private _makeWhereConditions(query: EntityQuerySet, where?: IEntityQuerySetWhere[], existsLink?: EntityLink): string[] {
    if (!where) {
      return [];
    }
    const findSetField =  this._findSetField(query);

    return where.reduce((items, item) => {
      const filters: string[] = [];

      if (item.equals) {
        const filterItems = item.equals.map((equals) => {
          if (!equals.attribute) {
            const alias = this._getTableAlias(query.link, findSetField!.attribute.adapter!.crossRelation);
            return SQLTemplates.equals(alias, findSetField!.attribute.adapter!.crossPk[0], this._addToParams(equals.value));
          }

          const findLink = this._getLink(equals.alias, query.link);
          const alias = this._getTableAlias(findLink, equals.attribute.adapter!.relation);
          if (equals.value === Object(equals.value)) {
            const value = (equals.value as IEntityQueryAlias<ScalarAttribute>);
            const alias = this._getTableAlias(this._getLink(value.alias, query.link, existsLink),
              value.attribute.adapter!.relation);
            const field = `${alias && `${alias}.`}${value.attribute.name}`;

            return SQLTemplates.equals(this._getTableAlias(this._getLink(equals.alias, query.link, existsLink),
              value.attribute.adapter!.relation),
               equals.attribute.adapter!.field,
              field)
          }
          if (equals.attribute.type === "String") {
            return SQLTemplates.equalsWithUpper(alias, equals.attribute.adapter!.field, this._addToParams(equals.value));
          } else {
            return SQLTemplates.equals(alias, equals.attribute.adapter!.field, this._addToParams(equals.value));
          }
        });
        const filter = SelectSet._arrayJoinWithBracket(filterItems, " AND ");
        if (filter) {
          filters.push(filter);
        }
      }

      return items.concat(filters);
    }, [] as string[]);
  }

  private _isExistsInLink(link: EntityLink, relationName: string): boolean {
    const existInFields = link.fields.some((field) => {
      if (field.links) {
        const attribute = field.attribute as EntityAttribute;
        switch (attribute.type) {
          case "Parent": {
            if (attribute.adapter && attribute.adapter.relation === relationName) {
              return true;
            }
            break;
          }
          case "Detail": {
            const pkAttr = link.entity.pk[0];
            if (pkAttr instanceof ScalarAttribute || pkAttr.type === "Entity") {
              if (pkAttr.adapter.relation === relationName) {
                return true;
              }
            }
            break;
          }
          case "Set": {
            const flag = field.setAttributes && field.setAttributes
              .some((attr) => attr.adapter!.relation === relationName);
            if (flag) {
              return true;
            }
            break;
          }
          case "Entity":
          default: {
            if (attribute.adapter) {
              return attribute.adapter.relation === relationName;
            }
            break;
          }
        }
        return field.links.some((fLink) => this._isExistsInLink(fLink, relationName));
      } else {
        const attribute = field.attribute as ScalarAttribute;
        return attribute.adapter!.relation === relationName;
      }
    });
    if (existInFields) {
      return true;
    }

    const where = this.query.options && this.query.options.where;
    if (where) {
        return true;
    }

    return false;
  }

  private _getLink(alias: string, link: EntityLink, existsLink?: EntityLink): EntityLink {
    const findLink = link.deepFindLink(alias) ? link.deepFindLink(alias) : existsLink && existsLink.deepFindLink(alias);
    if (!findLink) {
      throw new Error(`Alias ${alias} is not found`);
    }
    return findLink;
  }

  private _getExistsRelations(link: EntityLink): IRelation[] {
    return link.entity.adapter!.relation.filter((rel) => this._isExistsInLink(link, rel.relationName));
  }

  private _getTableAlias(link: EntityLink, relationName: string): string {
    let linkAlias = this._linkAliases.get(link);
    if (!linkAlias) {
      linkAlias = {};
      this._linkAliases.set(link, linkAlias);
    }
    let relAlias = linkAlias[relationName];
    let i = 0;
    if (!relAlias) {
      for (const values of this._linkAliases.values()) {
        i += Object.keys(values).length;
      }
      relAlias = `T$${i + 1}`;
      linkAlias[relationName] = relAlias;
    }
    return relAlias;
  }

  private _getFieldAlias(field: EntityLinkField, setAttr?: Attribute): string {
    if ((setAttr && !field.setAttributes)
      || (setAttr && field.setAttributes && !field.setAttributes.some((attr) => attr === setAttr))) {
      throw new Error("Incorrect set attribute");
    }
    let fieldAlias = this.fieldAliases.get(field);
    if (!fieldAlias) {
      fieldAlias = new Map<Attribute, string>();
      this.fieldAliases.set(field, fieldAlias);
    }
    let attrAlias = fieldAlias.get(setAttr || field.attribute);

    let i = 0;
    if (!attrAlias) {
      for (const values of this.fieldAliases.values()) {
        i += values.size;
      }
      attrAlias = `F$${i + 1}`;
      fieldAlias.set(setAttr || field.attribute, attrAlias);
    }
    return attrAlias;
  }

  private _addToParams(value: any): string {
    const length = Object.keys(this.params).length;
    const placeholder = `P$${length + 1}`;
    this.params[placeholder] = value;
    return `:${placeholder}`;
  }
}
