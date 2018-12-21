import {
  Attribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  EntityLink,
  EntityQuery,
  EntityQueryField,
  IEntityQueryWhere,
  IRelation,
  ScalarAttribute,
  SetAttribute
} from "gdmn-orm";

import {SQLTemplates} from "./SQLTemplates";

export interface IParams {
  [paramName: string]: any;
}

export class Select {

  public readonly sql: string = "";
  public readonly params: IParams = {};
  public readonly fieldAliases = new Map<EntityQueryField, Map<Attribute, string>>();

  private readonly _query: EntityQuery;
  private readonly _linkAliases = new Map<EntityLink, { [relationName: string]: string }>();

  constructor(query: EntityQuery) {
    this._query = query;

    this.sql = this._getSelect();

    // console.debug("===================\n" +
    //   "QUERY:\n" + this._query.serialize() + "\n" +
    //   "SQL:\n" + this.sql + "\n" +
    //   "PARAMS:\n" + JSON.stringify(this.params) + "\n" +
    //   "==================="
    // );
  }

  private static _arrayJoinWithBracket(array: string[], separator: string): string {
    if (array.length === 1) {
      return array.join(separator);
    } else if (array.length > 1) {
      return `(${array.join(separator)})`;
    }
    return "";
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
    const mainRelationName = Select._getOwnRelationName(entity);
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

  private _getSelect(): string {
    let sql = `SELECT`;

    if (this._query.options && this._query.options.first !== undefined) {
      sql += ` FIRST ${this._addToParams(this._query.options.first)}`;
    }

    if (this._query.options && this._query.options.skip !== undefined) {
      sql += ` SKIP ${this._addToParams(this._query.options.skip)}`;
    }

    sql += `\n${this._makeFields(this._query.link).join(",\n")}`;
    sql += `\n${this._makeFrom()}`;

    const sqlJoin = this._makeJoin(this._query.link).join("\n");
    if (sqlJoin) {
      sql += `\n${sqlJoin}`;
    }

    const sqlWhere = this._makeWhereLinkConditions(this._query.link)
      .concat(this._makeWhereConditions(this._query.options && this._query.options.where))
      .join("\n  AND ");
    if (sqlWhere) {
      sql += `\nWHERE ${sqlWhere}`;
    }

    const sqlOrder = this._makeOrder().join(", ");
    if (sqlOrder) {
      sql += `\nORDER BY ${sqlOrder}`;
    }

    return sql;
  }

  private _makeFields(link: EntityLink): string[] {
    const fields = link.fields
      .filter((field) => !field.link)
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        const tableAlias = this._getTableAlias(link, attribute.adapter!.relation);
        const fieldAlias = this._getFieldAlias(field);
        return SQLTemplates.field(tableAlias, fieldAlias, attribute.adapter!.field);
      });

    const joinedFields = link.fields.reduce((items, field) => {
      if (field.link) {
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
        return items.concat(this._makeFields(field.link));
      }
      return items;
    }, [] as string[]);

    return fields.concat(joinedFields);
  }

  private _makeFrom(): string {
    const link = this._query.link;

    const existsRelations = this._getExistsRelations(link);
    const from = existsRelations.map((rel, index) => {
      if (index) {
        return SQLTemplates.join(
          rel.relationName,
          this._getTableAlias(link, rel.relationName),
          Select._getPKFieldName(link.entity, rel.relationName),
          this._getTableAlias(link, existsRelations[0].relationName),
          Select._getPKFieldName(link.entity, existsRelations[0].relationName),
          rel.weak ? "LEFT" : ""
        );
      } else {
        return SQLTemplates.from(this._getTableAlias(link, rel.relationName), rel.relationName);
      }
    });

    if (!from.length) {
      const relationName = link.entity.adapter!.relation[0].relationName;
      from.push(SQLTemplates.from(this._getTableAlias(link, relationName), relationName));
    }

    return from.join("\n");
  }

  private _makeJoin(link: EntityLink): string[] {
    const existsRelations = this._getExistsRelations(link);
    if (!existsRelations.length) {
      existsRelations.push(link.entity.adapter!.relation[0]);
    }
    const firstRelationName = existsRelations[0].relationName;
    const firstPKFieldName = Select._getPKFieldName(link.entity, firstRelationName);

    return link.fields.reduce((joins, field) => {
      if (field.link) {
        const linkExistsRelations = this._getExistsRelations(field.link);
        if (!linkExistsRelations.length) {
          linkExistsRelations.push(field.link.entity.adapter!.relation[0]);
        }
        const linkFirstRelationName = linkExistsRelations[0].relationName;
        const linkFirstPKFieldName = Select._getPKFieldName(field.link.entity, linkFirstRelationName);

        switch (field.attribute.type) {
          case "Parent": {
            throw new Error("Unsupported yet");
          }
          case "Set": {
            const attr = field.attribute as SetAttribute;
            joins.push(
              SQLTemplates.join(
                attr.adapter!.crossRelation,
                this._getTableAlias(link, attr.adapter!.crossRelation),
                attr.adapter!.crossPk[0],
                this._getTableAlias(link, firstRelationName),
                Select._getPKFieldName(link.entity, firstRelationName),
                "LEFT"
              )
            );
            joins.push(
              SQLTemplates.join(
                linkFirstRelationName,
                this._getTableAlias(field.link, linkFirstRelationName),
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
                this._getTableAlias(field.link, mLink.detailRelation),
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
            const attr = field.attribute as EntityAttribute;
            joins.push(
              SQLTemplates.join(
                linkFirstRelationName,
                this._getTableAlias(field.link, linkFirstRelationName),
                linkFirstPKFieldName,
                this._getTableAlias(link, attr.adapter!.relation),
                attr.adapter!.field,
                "LEFT"
              )
            );
          }
        }
        linkExistsRelations.reduce((relJoins, rel) => {
          if (field.link && linkFirstRelationName !== rel.relationName) {
            relJoins.push(SQLTemplates.join(
              rel.relationName,
              this._getTableAlias(link, rel.relationName),
              Select._getPKFieldName(field.link.entity, rel.relationName),
              this._getTableAlias(link, linkExistsRelations[0].relationName),
              Select._getPKFieldName(field.link.entity, linkExistsRelations[0].relationName),
              rel.weak ? "LEFT" : ""
            ));
          }
          return relJoins;
        }, joins);

        return joins.concat(this._makeJoin(field.link));
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

  private _makeWhereConditions(where?: IEntityQueryWhere[]): string[] {
    if (!where) {
      return [];
    }
    return where.reduce((items, item) => {
      const filters: string[] = [];

      if (item.isNull) {
        const filterItems = item.isNull.map((isNull) => {
          const findLink = this._getLink(isNull.alias);
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
          const findLink = this._getLink(equals.alias);
          const alias = this._getTableAlias(findLink, equals.attribute.adapter!.relation);
          return SQLTemplates.equals(alias, equals.attribute.adapter!.field, this._addToParams(equals.value));
        });
        const filter = Select._arrayJoinWithBracket(filterItems, " AND ");
        if (filter) {
          filters.push(filter);
        }
      }

      if (item.and) {
        const filter = Select._arrayJoinWithBracket(this._makeWhereConditions(item.and), " AND ");
        if (filter) {
          filters.push(filter);
        }
      }
      if (item.or) {
        const filter = Select._arrayJoinWithBracket(this._makeWhereConditions(item.or), " OR ");
        if (filter) {
          filters.push(filter);
        }
      }
      if (item.not) {
        const filter = Select._arrayJoinWithBracket(this._makeWhereConditions(item.not), " AND ");
        if (filter) {
          filters.push(filter);
        }
      }

      return items.concat(filters);
    }, [] as string[]);
  }

  private _makeOrder(): string[] {
    if (this._query.options && this._query.options.order) {
      return this._query.options.order.reduce((orders, order) => {
        const link = this._getLink(order.alias);
        const alias = this._getTableAlias(link, order.attribute.adapter!.relation);
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
      if (field.link) {
        const attribute = field.attribute as EntityAttribute;
        switch (attribute.type) {
          case "Parent": {
            throw new Error("Unsupported yet");
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
        return this._isExistsInLink(field.link, relationName);
      } else {
        const attribute = field.attribute as ScalarAttribute;
        return attribute.adapter!.relation === relationName;
      }
    });
    if (existInFields) {
      return true;
    }

    const where = this._query.options && this._query.options.where;
    if (where) {
      const existsInWhere = where.some((filter) => this._isExistsInWhere(filter, relationName));
      if (existsInWhere) {
        return true;
      }
    }

    const order = this._query.options && this._query.options.order;
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

  private _getLink(alias: string): EntityLink {
    const findLink = this._query.link.deepFindLink(alias);
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

  private _getFieldAlias(field: EntityQueryField, setAttr?: Attribute): string {
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
