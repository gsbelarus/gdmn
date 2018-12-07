import {
  Attribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  EntityLink,
  EntityQuery,
  EntityQueryField,
  IEntityQueryWhere,
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

  private static _getMainRelationName(entity: Entity): string {
    return entity.adapter!.relation[0].relationName;
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
    sql += `\n${this._makeFrom(this._query.link)}`;

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

  private _makeFrom(link: EntityLink): string {
    const mainRelationName = Select._getMainRelationName(link.entity);

    const from = link.entity.adapter!.relation.reduce((joins, rel) => {
      if (rel.relationName === mainRelationName) {
        joins.push(SQLTemplates.from(this._getTableAlias(link, mainRelationName), mainRelationName));
      } else {
        if (this._isExistsInLink(link, rel.relationName)) {
          joins.push(SQLTemplates.join(
            rel.relationName,
            this._getTableAlias(link, rel.relationName),
            Select._getPKFieldName(link.entity, rel.relationName),
            this._getTableAlias(link, mainRelationName),
            Select._getPKFieldName(link.entity, mainRelationName)
          ));
        }
      }
      return joins;
    }, [] as string[]);

    return from.join("\n");
  }

  private _makeJoin(link: EntityLink): string[] {
    const mainRelationName = Select._getMainRelationName(link.entity);
    const pkFieldName = Select._getPKFieldName(link.entity, mainRelationName);

    return link.fields.reduce((joins, field) => {
      if (field.link) {
        const linkMainRelationName = Select._getMainRelationName(field.link.entity);
        const linkPKFieldName = Select._getPKFieldName(field.link.entity, linkMainRelationName);

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
                this._getTableAlias(link, mainRelationName),
                pkFieldName
              )
            );
            joins.push(
              SQLTemplates.join(
                linkMainRelationName,
                this._getTableAlias(field.link, linkMainRelationName),
                linkPKFieldName,
                this._getTableAlias(link, attr.adapter!.crossRelation),
                attr.adapter!.crossPk[1]
              )
            );
            break;
          }
          case "Detail": {
            const attr = field.attribute as DetailAttribute;
            joins.push(
              SQLTemplates.join(
                linkMainRelationName,
                this._getTableAlias(field.link, linkMainRelationName),
                attr.adapter!.masterLinks[0].link2masterField,
                this._getTableAlias(link, mainRelationName),
                pkFieldName
              )
            );
            break;
          }
          case "Entity":
          default: {
            const attr = field.attribute as EntityAttribute;
            joins.push(
              SQLTemplates.join(
                linkMainRelationName,
                this._getTableAlias(field.link, linkMainRelationName),
                linkPKFieldName,
                this._getTableAlias(link, attr.adapter!.relation),
                attr.adapter!.field
              )
            );
          }
        }

        field.link.entity.adapter!.relation.reduce((relJoins, rel, index) => {
          if (index && field.link) {
            if (this._isExistsInLink(field.link, rel.relationName)) {
              relJoins.push(SQLTemplates.join(
                rel.relationName,
                this._getTableAlias(link, rel.relationName),
                Select._getPKFieldName(field.link.entity, rel.relationName),
                this._getTableAlias(link, mainRelationName),
                pkFieldName
              ));
            }
          }
          return relJoins;
        }, joins);

        return joins.concat(this._makeJoin(field.link));
      }
      return joins;
    }, [] as string[]);
  }

  private _makeWhereLinkConditions(link: EntityLink): string[] {
    const whereEquals = link.entity.adapter!.relation.reduce((equals, rel) => {
      if (rel.selector) {
        if (this._isExistsInLink(link, rel.relationName)) {
          equals.push(
            SQLTemplates.equals(
              this._getTableAlias(link, rel.relationName),
              rel.selector.field,
              this._addToParams(rel.selector.value)
            )
          );
        }
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
    if (Select._getMainRelationName(link.entity) === relationName) {
      return true;
    }

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
    if (where.not && where.not.some((item) => this._isExistsInWhere(item, relationName))) {
      return true;
    }
    return false;
  }

  private _getLink(alias: string): EntityLink {
    const findLink = this._query.link.deepFindLink(alias);
    if (!findLink) {
      throw new Error(`Alias ${alias} is not found`);
    }
    return findLink;
  }

  private _getTableAlias(link: EntityLink, relationName: string): string {
    const ownRelation = Select._getOwnRelationName(link.entity);
    const linkAliasesCount = this._linkAliases.size;
    let linkAlias = this._linkAliases.get(link);
    if (!linkAlias) {
      linkAlias = {};
      this._linkAliases.set(link, linkAlias);
    }
    const relAliasesCount = Object.keys(linkAlias).length;
    let relAlias = linkAlias[relationName];
    if (!relAlias) {
      relAlias = ownRelation === relationName
        ? `E$${linkAliasesCount + 1}`
        : `E$${linkAliasesCount || 1}_${relAliasesCount + 1}`;
      linkAlias[relationName] = relAlias;
    }
    return relAlias;
  }

  private _getFieldAlias(field: EntityQueryField, setAttr?: Attribute): string {
    if ((setAttr && !field.setAttributes)
      || (setAttr && field.setAttributes && !field.setAttributes.some((attr) => attr === setAttr))) {
      throw new Error("Incorrect set attribute");
    }
    const fieldAliasesCount = this.fieldAliases.size;
    let fieldAlias = this.fieldAliases.get(field);
    if (!fieldAlias) {
      fieldAlias = new Map<Attribute, string>();
      this.fieldAliases.set(field, fieldAlias);
    }
    const attrAliasesCount = fieldAlias.size;
    let attrAlias = fieldAlias.get(setAttr || field.attribute);
    if (!attrAlias) {
      attrAlias = setAttr
        ? `A$${fieldAliasesCount + 1}_${attrAliasesCount + 1}`
        : `A$${fieldAliasesCount + 1}`;
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
