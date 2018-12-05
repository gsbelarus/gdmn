import {
  Attribute,
  DetailAttribute,
  Entity,
  EntityLink,
  EntityQuery,
  EntityQueryField,
  IEntityLinkAlias,
  IEntityQueryWhere,
  ScalarAttribute,
  SetAttribute
} from "gdmn-orm";
import {SQLTemplates} from "./SQLTemplates";

export interface IParams {
  [paramName: string]: any;
}

interface IEntityQueryAlias {
  [relationName: string]: string;
}

export interface IEntityQueryFieldAlias {
  [attrName: string]: string;
}

export class Select {

  public readonly sql: string = "";
  public readonly params: IParams = {};
  public readonly fieldAliases = new Map<EntityQueryField, IEntityQueryFieldAlias>();

  private readonly _query: EntityQuery;

  private readonly _linkAliases = new Map<EntityLink, IEntityQueryAlias>();

  constructor(query: EntityQuery) {
    this._query = query;

    this._createAliases(this._query.link);
    this.sql = this._getSelect();

    console.debug("===================\n" +
      "QUERY:\n" + this._query.serialize() + "\n" +
      "SQL:\n" + this.sql + "\n" +
      "PARAMS:\n" + JSON.stringify(this.params) + "\n" +
      "==================="
    );
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
    return entity.adapter ? entity.adapter.relation[0].relationName : entity.name;
  }

  private static _getPKFieldName(entity: Entity, relationName: string): string {
    if (entity.adapter) {
      const relation = entity.adapter.relation.find((rel) => rel.relationName === relationName);
      if (relation && relation.pk && relation.pk.length) {
        return relation.pk[0];
      }
    }
    const mainRelationName = Select._getMainRelationName(entity);
    if (mainRelationName === relationName) {
      const pkAttr = entity.pk[0];
      if (pkAttr instanceof ScalarAttribute || pkAttr.type === "Entity") {
        return pkAttr.adapter ? pkAttr.adapter.fieldName : pkAttr.name;
      }
    }
    if (entity.parent) {
      return this._getPKFieldName(entity.parent, relationName);
    }
    throw new Error(`Primary key is not found for ${relationName} relation`);
  }

  private static _getAttrAdapter(entity: Entity, attribute: Attribute): { relationName: string, fieldName: string, ownFk?: string, refFk?: string } {
    let relationName = Select._getMainRelationName(entity);
    let fieldName = attribute.name;
    if (attribute.adapter) {
      switch (attribute.type) {
        case "Parent": {
          throw new Error("Unsupported yet");
        }
        case "Set": {
          const attr = attribute as SetAttribute;
          if (attr.adapter) {
            relationName = attr.adapter.crossRelation;
            fieldName = attr.adapter.presentationField || "";
          }
          break;
        }
        case "Detail": {
          const attr = attribute as DetailAttribute;
          if (attr.adapter) {
            relationName = attr.adapter.masterLinks[0].detailRelation;
            fieldName = attr.adapter.masterLinks[0].link2masterField;
          }
          break;
        }
      }
      if (attribute instanceof ScalarAttribute) {
        if (attribute.adapter) {
          relationName = attribute.adapter.relation;
          fieldName = attribute.adapter.field;
        }
      }
    }

    return {relationName, fieldName};
  }

  private static _checkInAttrMap(entity: Entity,
                                 relationName: string,
                                 map?: IEntityLinkAlias<Map<Attribute, any>>): boolean {
    if (map) {
      return Object.values(map).some((value) => {
        for (const key of value.keys()) {
          if (Select._getAttrAdapter(entity, key).relationName === relationName) {
            return true;
          }
        }
        return false;
      });
    }
    return false;
  }

  private _createAliases(link: EntityLink): void {
    const aliasNumber = this._linkAliases.size + 1;
    const queryAlias = link.entity.adapter.relation.reduce((alias, rel, index) => {
      alias[rel.relationName] = index === 0 ? `E$${aliasNumber}` : `E$${aliasNumber}_${Object.keys(alias).length + 1}`;
      return alias;
    }, {} as IEntityQueryAlias);
    this._linkAliases.set(link, queryAlias);

    link.fields
      .filter((field) => !field.link)
      .reduce((aliases, field) => (
        aliases.set(field, {[field.attribute.name]: `F$${aliases.size + 1}`})
      ), this.fieldAliases);

    link.fields.forEach((field) => {
      if (field.link) {
        if (field.attribute.type === "Set") {
          if (field.setAttributes) {
            const fieldAlias = field.setAttributes.reduce((alias, attr) => {
              alias[attr.name] = `F$${this.fieldAliases.size + 1}_${Object.keys(alias).length + 1}`;
              return alias;
            }, {} as IEntityQueryFieldAlias);
            this.fieldAliases.set(field, fieldAlias);
          }
          const setAttr = field.attribute as SetAttribute;
          if (setAttr.adapter) {
            const setAdapter = Select._getAttrAdapter(field.link.entity, setAttr);
            const alias = this._linkAliases.get(link);
            if (alias) {
              alias[setAdapter.relationName] = `E$${aliasNumber}_${Object.keys(alias).length + 1}$S`;
            }
          }
        }
        this._createAliases(field.link);
      }
    });
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
        const attrAdapter = Select._getAttrAdapter(link.entity, field.attribute);
        return SQLTemplates.field(
          this._getTableAlias(link, attrAdapter.relationName),
          this._getFieldAlias(field),
          attrAdapter.fieldName
        );
      });

    const joinedFields = link.fields.reduce((items, field) => {
      if (field.link) {
        if (field.setAttributes) {
          const crossFields = field.setAttributes.map((attr) => {
            const crossAttrAdapter = Select._getAttrAdapter(link.entity, field.attribute);
            const attrAdapter = Select._getAttrAdapter(link.entity, attr);
            return SQLTemplates.field(
              this._getTableAlias(link, crossAttrAdapter.relationName),
              this._getFieldAlias(field, attr),
              attrAdapter.fieldName
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
    const primaryAttr = link.entity.pk[0];
    const primaryAttrAdapter = Select._getAttrAdapter(link.entity, primaryAttr);

    const mainRelation = link.entity.adapter.relation[0];
    const from = SQLTemplates.from(this._getTableAlias(link), mainRelation.relationName);
    const join = link.entity.adapter.relation.reduce((joins, rel, index) => {
      if (index) {
        if (this._isExistInQuery(link, rel.relationName)) {
          joins.push(SQLTemplates.join(
            rel.relationName,
            this._getTableAlias(link, rel.relationName),
            Select._getPKFieldName(link.entity, rel.relationName),
            this._getTableAlias(link),
            primaryAttrAdapter.fieldName
          ));
        }
      }
      return joins;
    }, [] as string[]);

    join.unshift(from);
    return join.join("\n");
  }

  private _makeJoin(link: EntityLink): string[] {
    const pkAttr = link.entity.pk[0];
    const pkAttrAdapter = Select._getAttrAdapter(link.entity, pkAttr);

    return link.fields.reduce((joins, field) => {
      if (field.link) {
        const attrAdapter = Select._getAttrAdapter(link.entity, field.attribute);
        const nestedPKAttr = field.link.entity.pk[0];
        const nestedPKAttrAdapter = Select._getAttrAdapter(field.link.entity, nestedPKAttr);

        const mainRelationName = Select._getMainRelationName(field.link.entity);
        switch (field.attribute.type) {
          case "Parent": {
            throw new Error("Unsupported yet");
          }
          case "Set": {
            const attr = field.attribute as SetAttribute;
            joins.push(
              SQLTemplates.join(
                attrAdapter.relationName,
                this._getTableAlias(link, attrAdapter.relationName),
                attr.adapter!.crossPk[0],
                this._getTableAlias(link),
                pkAttrAdapter.fieldName
              )
            );
            joins.push(
              SQLTemplates.join(
                mainRelationName,
                this._getTableAlias(field.link, mainRelationName),
                nestedPKAttrAdapter.fieldName,
                this._getTableAlias(link, attrAdapter.relationName),
                attr.adapter!.crossPk[1]
              )
            );
            break;
          }
          case "Detail": {
            joins.push(
              SQLTemplates.join(
                mainRelationName,
                this._getTableAlias(field.link, mainRelationName),
                attrAdapter.fieldName,
                this._getTableAlias(link, attrAdapter.relationName),
                nestedPKAttrAdapter.fieldName
              )
            );
            break;
          }
          default: {
            joins.push(
              SQLTemplates.join(
                mainRelationName,
                this._getTableAlias(field.link, mainRelationName),
                nestedPKAttrAdapter.fieldName,
                this._getTableAlias(link, attrAdapter.relationName),
                attrAdapter.fieldName
              )
            );
            break;
          }
        }
        field.link.entity.adapter.relation.reduce((relJoins, rel, index) => {
          if (index && field.link) {
            if (this._isExistInQuery(field.link, rel.relationName)) {
              relJoins.push(
                SQLTemplates.join(
                  rel.relationName,
                  this._getTableAlias(field.link, rel.relationName),
                  Select._getPKFieldName(field.link.entity, rel.relationName),
                  this._getTableAlias(field.link),
                  pkAttrAdapter.fieldName
                )
              );
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
    const whereEquals = link.entity.adapter.relation.reduce((equals, rel) => {
      if (rel.selector) {
        if (this._isExistInQuery(link, rel.relationName)) {
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

  private _makeWhereConditions(where?: IEntityQueryWhere): string[] {
    if (!where) {
      return [];
    }
    const {isNull, equals, greater, less, and, or, not} = where;

    let filters: string[] = [];
    if (isNull) {
      filters = Object.entries(isNull)
        .reduce((items, [linkAlias, condition]) => {
          const findLink = this._deepFindLinkByAlias(this._query.link, linkAlias);
          const attrAdapter = Select._getAttrAdapter(findLink.entity, condition);
          const alias = this._getTableAlias(findLink, attrAdapter.relationName);
          items.push(SQLTemplates.isNull(alias, attrAdapter.fieldName));
          return items;
        }, filters);
    }
    if (equals) {
      filters = Object.entries(equals)
        .reduce((items, [linkAlias, condition]) => {
          const findLink = this._deepFindLinkByAlias(this._query.link, linkAlias);
          const equalsFilters = [];
          for (const [attribute, value] of condition.entries()) {
            const attrAdapter = Select._getAttrAdapter(findLink.entity, attribute);
            const alias = this._getTableAlias(findLink, attrAdapter.relationName);
            equalsFilters.push(SQLTemplates.equals(alias, attrAdapter.fieldName, this._addToParams(value)));
          }
          const equalsFilter = Select._arrayJoinWithBracket(equalsFilters, " AND ");
          if (equalsFilter) {
            items.push(equalsFilter);
          }
          return items;
        }, filters);
    }
    if (greater) {
      filters = Object.entries(greater)
        .reduce((items, [linkAlias, condition]) => {
          const findLink = this._deepFindLinkByAlias(this._query.link, linkAlias);
          const greaterFilters = [];
          for (const [attribute, value] of condition) {
            const attrAdapter = Select._getAttrAdapter(findLink.entity, attribute);
            const alias = this._getTableAlias(findLink, attrAdapter.relationName);
            greaterFilters.push(SQLTemplates.greater(alias, attrAdapter.fieldName, this._addToParams(value)));
          }
          const greaterFilter = Select._arrayJoinWithBracket(greaterFilters, " AND ");
          if (greaterFilter) {
            items.push(greaterFilter);
          }
          return items;
        }, filters);
    }
    if (less) {
      filters = Object.entries(less)
        .reduce((items, [linkAlias, condition]) => {
          const findLink = this._deepFindLinkByAlias(this._query.link, linkAlias);
          const lessFilters = [];
          for (const [attribute, value] of condition) {
            const attrAdapter = Select._getAttrAdapter(findLink.entity, attribute);
            const alias = this._getTableAlias(findLink, attrAdapter.relationName);
            lessFilters.push(SQLTemplates.less(alias, attrAdapter.fieldName, this._addToParams(value)));
          }
          const lessFilter = Select._arrayJoinWithBracket(lessFilters, " AND ");
          if (lessFilter) {
            items.push(lessFilter);
          }
          return items;
        }, filters);
    }

    const notFilter = Select._arrayJoinWithBracket(this._makeWhereConditions(not), " AND ");
    if (notFilter) {
      filters.push(`NOT ${notFilter}`);
    }
    const andFilter = Select._arrayJoinWithBracket(this._makeWhereConditions(and), " AND ");
    if (andFilter) {
      filters.push(andFilter);
    }
    const orFilter = Select._arrayJoinWithBracket(this._makeWhereConditions(or), " OR ");
    if (orFilter) {
      filters.push(orFilter);
    }

    return filters;
  }

  private _makeOrder(): string[] {
    if (this._query.options && this._query.options.order) {
      return Object.entries(this._query.options.order).reduce((orders, [linkAlias, order]) => {
        const link = this._deepFindLinkByAlias(this._query.link, linkAlias);
        for (const [key, value] of order) {
          const attrAdapter = Select._getAttrAdapter(link.entity, key);
          const alias = this._getTableAlias(link, attrAdapter.relationName);

          orders.push(SQLTemplates.order(alias, attrAdapter.fieldName, value.toUpperCase()));
        }
        return orders;
      }, [] as string[]);
    }
    return [];
  }

  private _getTableAlias(link: EntityLink, relationName?: string): string {
    const alias = this._linkAliases.get(link);
    if (alias) {
      if (relationName) {
        return alias[relationName] || "";
      }
      const mainRel = link.entity.adapter.relation[0];
      return alias[mainRel.relationName] || "";
    }
    return "";
  }

  private _getFieldAlias(field: EntityQueryField, attr?: Attribute): string {
    const fieldAlias = this.fieldAliases.get(field);
    if (fieldAlias) {
      return fieldAlias[(attr && attr.name) || Object.keys(fieldAlias)[0]];
    }
    return "";
  }

  private _deepFindLinkByAlias(link: EntityLink, alias: string): EntityLink {
    if (link.alias === alias) {
      return link;
    }
    for (const field of link.fields) {
      if (field.link) {
        const find = this._deepFindLinkByAlias(field.link, alias);
        if (find) {
          return find;
        }
      }
    }
    throw new Error(`Alias ${alias} is not found`);
  }

  private _isExistInQuery(link: EntityLink, relationName: string): boolean {
    const existInFields = link.fields.some((field) => {
      const attrAdapter = Select._getAttrAdapter(link.entity, field.attribute);
      return attrAdapter.relationName === relationName;
    });
    if (existInFields) {
      return true;
    }

    const where = this._query.options && this._query.options.where;
    if (where) {
      if (where.isNull && Object.values(where.isNull).some((condition) => (
        Select._getAttrAdapter(link.entity, condition).relationName === relationName
      ))) {
        return true;
      }
      if (Select._checkInAttrMap(link.entity, relationName, where.equals)
        || Select._checkInAttrMap(link.entity, relationName, where.greater)
        || Select._checkInAttrMap(link.entity, relationName, where.less)) {
        return true;
      }
    }

    return Select._checkInAttrMap(link.entity, relationName, this._query.options && this._query.options.order);
  }

  private _addToParams(value: any): string {
    const length = Object.keys(this.params).length;
    const placeholder = `P$${length + 1}`;
    this.params[placeholder] = value;
    return `:${placeholder}`;
  }
}
