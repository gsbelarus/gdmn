import {
  Attribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  EntityLink,
  EntityLinkField,
  EntityQuery,
  IEntityQueryWhere,
  IRelation,
  ScalarAttribute,
  SetAttribute
} from "gdmn-orm";
import {IParams} from "../..";
import {AdapterUtils} from "../../AdapterUtils";
import {Constants} from "../../ddl/Constants";
import {SQLTemplates} from "./SQLTemplates";
import {VirtualQueries} from "./VirtualQueries";

export interface IParams {
  [paramName: string]: any;
}

export class Select {

  public readonly query: EntityQuery;
  public readonly sql: string = "";
  public readonly params: IParams = {};
  public readonly fieldAliases = new Map<EntityLinkField, Map<Attribute, string>>();

  private readonly _linkAliases = new Map<EntityLink, { [relationName: string]: string }>();

  constructor(query: EntityQuery) {
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

  private _getSelect(query: EntityQuery, first?: boolean, withoutAlias?: boolean): string {
    const {options, link} = query;

    let sql = `SELECT`;

    if (options && options.first !== undefined) {
      sql += ` FIRST ${this._addToParams(options.first)}`;
    }

    if (options && options.skip !== undefined) {
      sql += ` SKIP ${this._addToParams(options.skip)}`;
    }

    sql += `\n${this._makeFields(link, withoutAlias).join(",\n")}`;
    sql += `\n${this._makeFrom(query, first)}`;

    const sqlJoin = this._makeJoin(link).join("\n");
    if (sqlJoin) {
      sql += `\n${sqlJoin}`;
    }

    const sqlWhere = this._makeWhereLinkConditions(link)
      .concat(this._makeWhereConditions(link, options && options.where))
      .join("\n  AND ");
    if (sqlWhere) {
      sql += `\nWHERE ${sqlWhere}`;
    }

    const sqlOrder = this._makeOrder(link).join(", ");
    if (sqlOrder) {
      sql += `\nORDER BY ${sqlOrder}`;
    }

    return sql;
  }

  private _makeFields(link: EntityLink, withoutAlias?: boolean): string[] {
    const fields = link.fields
      .filter((field) => !field.links)
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        const tableAlias = this._getTableAlias(link, attribute.adapter!.relation);
        const fieldAlias = this._getFieldAlias(field);
        return SQLTemplates.field(tableAlias, fieldAlias, attribute.adapter!.field, withoutAlias);
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

  private _makeFrom(query: EntityQuery, first?: boolean): string {
    const {link} = query;

    const mainRelation = AdapterUtils.getMainRelation(link.entity);
    const from = link.entity.adapter!.relation.map((rel) => {
      if (rel.relationName == mainRelation.relationName) {
        if (!link.entity.isIntervalTree && link.entity.isTree && first) {

          const virtualTree = this.query.link.fields
            .filter((field) => field.attribute.type === "Parent")
            .map((field) => {
              const virtualQuery = VirtualQueries.makeVirtualQuery(query);
              const virtualQuery2 = VirtualQueries.makeSecondVirtualQuery(query, true);
              const virtualQuery3 = VirtualQueries.makeThirdVirtualQuery(query, false);

              const mainRelation = AdapterUtils.getMainRelation(virtualQuery.link.entity);
              const from = virtualQuery.link.entity.adapter!.relation.map((rel) => {

                if (rel.relationName == mainRelation.relationName) {
                  const leftTableWithRecursive = this._getSelect(virtualQuery2, false, true);
                  const rightTableWithRecursive = this._getSelect(virtualQuery3, false, true);
                  const tableWithRecursive = this._getSelect(virtualQuery, false, true);

                  // TODO field.links![0]
                  return SQLTemplates.fromWithTree(this._getTableAlias(field.links![0], this.query.link.entity.name),
                    rel.relationName, leftTableWithRecursive, rightTableWithRecursive, tableWithRecursive);
                }
              });
              return from.join("\n");
            });

          if (virtualTree.length > 0) {
            return virtualTree;
          }
        }
        return SQLTemplates.from(this._getTableAlias(link, rel.relationName), rel.relationName);
      } else {
        return SQLTemplates.join(
          rel.relationName,
          this._getTableAlias(link, rel.relationName),
          AdapterUtils.getPKFieldName(link.entity, rel.relationName),
          this._getTableAlias(link, mainRelation.relationName),
          AdapterUtils.getPKFieldName(link.entity, mainRelation.relationName),
          rel.weak ? "LEFT" : ""
        );
      }
    });

    return from.join("\n");
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
                  attr.adapter!.crossRelation,
                  this._getTableAlias(link, attr.adapter!.crossRelation),
                  attr.adapter!.crossPk[0],
                  this._getTableAlias(link, firstRelationName),
                  AdapterUtils.getPKFieldName(link.entity, firstRelationName),
                  "LEFT"
                )
              );
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
            case "Detail": {  // TODO
              const attr = field.attribute as DetailAttribute;
              const mLink = attr.adapter!.masterLinks.find((l) => l.detailRelation === linkFirstRelationName);
              if (!mLink) {
                throw new Error("Internal");
              }
              joins.push(
                SQLTemplates.join(
                  mLink.detailRelation,
                  this._getTableAlias(fLink, mLink.detailRelation),
                  mLink.link2masterField,
                  this._getTableAlias(link, firstRelationName),
                  firstPKFieldName,
                  "LEFT"
                )
              );
              break;
            }
            case "Entity":
            default: {
              if (!fLink.entity.isIntervalTree && fLink.entity.isTree) {
                const forTreeQuery = new EntityQuery(fLink);

                const virtualQuery = VirtualQueries.makeVirtualQuery(forTreeQuery);
                const virtualQuery2 = VirtualQueries.makeSecondVirtualQuery(forTreeQuery, true);
                const virtualQuery3 = VirtualQueries.makeThirdVirtualQuery(forTreeQuery, false);

                const mainRelation = AdapterUtils.getMainRelation(virtualQuery.link.entity);
                const from = virtualQuery.link.entity.adapter!.relation.map((rel) => {

                  if (rel.relationName == mainRelation.relationName) {
                    const leftTableWithRecursive = this._getSelect(virtualQuery2, false, true);
                    const rightTableWithRecursive = this._getSelect(virtualQuery3, false, true);
                    const tableWithRecursive = this._getSelect(virtualQuery, false, true);


                    const sqlText = SQLTemplates.joinWithSimpleTree(this._getTableAlias(fLink, this.query.link.entity.name),
                      rel.relationName, leftTableWithRecursive, rightTableWithRecursive, tableWithRecursive);

                    const attr = field.attribute as EntityAttribute;
                    joins.push(
                      SQLTemplates.join(
                        sqlText,
                        this._getTableAlias(fLink, linkFirstRelationName),
                        linkFirstPKFieldName,
                        this._getTableAlias(link, attr.adapter!.relation),
                        attr.adapter!.field
                      )
                    );
                  }
                });
                break;
              }

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

  private _makeWhereConditions(link: EntityLink, where?: IEntityQueryWhere[]): string[] {
    if (!where) {
      return [];
    }
    return where.reduce((items, item) => {
      const filters: string[] = [];

      if (item.isNull) {
        const filterItems = item.isNull.map((isNull) => {
          const findLink = this._getLink(isNull.alias, link);
          const alias = this._getTableAlias(findLink, isNull.attribute.adapter!.relation);
          return SQLTemplates.isNull(alias, isNull.attribute.adapter!.field);
        });
        const filter = Select._arrayJoinWithBracket(filterItems, " AND ");
        if (filter) {
          filters.push(filter);
        }
      }
      if (item.equals) {
        const filterItems = item.equals.map((equals) => {
          const findLink = this._getLink(equals.alias, link);
          const alias = this._getTableAlias(findLink, equals.attribute.adapter!.relation);
          if (equals.attribute.type === "String") {
            return SQLTemplates.equalsWithUpper(alias, equals.attribute.adapter!.field, this._addToParams(equals.value));
          } else {
            return SQLTemplates.equals(alias, equals.attribute.adapter!.field, this._addToParams(equals.value));
          }
        });
        const filter = Select._arrayJoinWithBracket(filterItems, " AND ");
        if (filter) {
          filters.push(filter);
        }
      }

      if (item.and) {
        const filter = Select._arrayJoinWithBracket(this._makeWhereConditions(link, item.and), " AND ");
        if (filter) {
          filters.push(filter);
        }
      }
      if (item.or) {
        const filter = Select._arrayJoinWithBracket(this._makeWhereConditions(link, item.or), " OR ");
        if (filter) {
          filters.push(filter);
        }
      }
      if (item.not) {
        const filter = Select._arrayJoinWithBracket(this._makeWhereConditions(link, item.not), " AND ");
        if (filter) {
          filters.push(filter);
        }
      }

      return items.concat(filters);
    }, [] as string[]);
  }

  private _makeOrder(link: EntityLink): string[] {
    if (this.query.options && this.query.options.order) {
      return this.query.options.order.reduce((orders, order) => {
        const getlink = this._getLink(order.alias, link);
        const alias = this._getTableAlias(getlink, order.attribute.adapter!.relation);
        orders.push(
          SQLTemplates.order(alias, order.attribute.adapter!.field, order.type || "ASC")
        );
        return orders;
      }, [] as string[]);
    }
    return [];
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
      const existsInWhere = where.some((filter) => this._isExistsInWhere(filter, relationName));
      if (existsInWhere) {
        return true;
      }
    }

    const order = this.query.options && this.query.options.order;
    if (order) {
      const existsInOrder = order.some((opt) => opt.attribute.adapter!.relation === relationName);
      if (existsInOrder) {
        return true;
      }
    }
    return false;
  }

  private _isExistsInWhere(where: IEntityQueryWhere, relationName: string): boolean {
    if (where.isNull &&
      where.isNull.some((isNull) => isNull.attribute.adapter!.relation === relationName)) {
      return true;
    }
    if (where.equals &&
      where.equals.some((equals) => equals.attribute.adapter!.relation === relationName)) {
      return true;
    }

    if (where.and && where.and.some((item) => this._isExistsInWhere(item, relationName))) {
      return true;
    }
    if (where.or && where.or.some((item) => this._isExistsInWhere(item, relationName))) {
      return true;
    }
    return !!where.not && where.not.some((item) => this._isExistsInWhere(item, relationName));

  }

  private _getLink(alias: string, link: EntityLink): EntityLink {
    const findLink = link.deepFindLink(alias);
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
