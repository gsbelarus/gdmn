import {
  Attribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  EntityLink,
  EntityQuery,
  EntityQueryField,
  EntityQueryOptions,
  IEntityQueryWhere,
  IEntityQueryWhereValue,
  IRelation,
  ScalarAttribute,
  SetAttribute,
  StringAttribute
} from "gdmn-orm";
import {Builder} from "../../ddl/builder/Builder";
import {Constants} from "../../ddl/Constants";
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
    this.sql = this._getSelect(this._query, true);
  }

  private static _arrayJoinWithBracket(array: string[], separator: string): string {
    if (array.length === 1) {
      return array.join(separator);
    } else if (array.length > 1) {
      return `(${array.join(separator)})`;
    }
    return "";
  }

  private static _getMainRelationName(entity: Entity): IRelation {
    return entity.adapter!.relation[0];
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

  private _getSelect(query: EntityQuery, first?: boolean, withoutAlies?: boolean): string {
    const {options, link} = query;

    let sql = `SELECT`;

    if (options && options.first !== undefined) {
      sql += ` FIRST ${this._addToParams(options.first)}`;
    }

    if (options && options.skip !== undefined) {
      sql += ` SKIP ${this._addToParams(options.skip)}`;
    }

    sql += `\n${this._makeFields(link, withoutAlies).join(",\n")}`;
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

  private _makeFields(link: EntityLink, withoutAlies?: boolean): string[] {
    const fields = link.fields
      .filter((field) => !field.link)
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        const tableAlias = this._getTableAlias(link, attribute.adapter!.relation);
        const fieldAlias = this._getFieldAlias(field);
        return SQLTemplates.field(tableAlias, fieldAlias, attribute.adapter!.field, withoutAlies);
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

  private _makeVirtualQuery(query: EntityQuery): EntityQuery {
    const virtualTree = this._makeVirtualTree(query.link);

    const linkTree = new EntityLink(virtualTree, "TREE", Object.values(virtualTree!.attributes)
      .filter(value => value instanceof ScalarAttribute)
      .map(value => new EntityQueryField(value)));

    return new EntityQuery(linkTree);
  }

  private _makeQueryToTree(): Entity {
    let queryToTree = new Entity({
      name: "TREE",
      lName: {},
      adapter: {relation: [{relationName: "TREE", pk: [Constants.DEFAULT_PARENT_KEY_NAME]}]}
    });

    queryToTree.add(new StringAttribute({
      name: Constants.DEFAULT_ID_NAME,
      lName: {ru: {name: "Идентификатор"}},
      adapter: {
        relation: Builder._getOwnRelationName(queryToTree),
        field: Constants.DEFAULT_ID_NAME
      }
    }));

    const fieldParent = new StringAttribute({
      name: "PARENT",
      lName: {},
      entities: [queryToTree],
      adapter: {relation: "TREE", field: "PARENT"}
    });
    queryToTree.add(fieldParent);

    return queryToTree;
  }

  private _makeVirtualTree(link: EntityLink): Entity {
    let queryToTree = this._makeQueryToTree();

    link.fields
      .filter((field) => !field.link)
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        if (!link.entity.isIntervalTree && link.entity.isTree && queryToTree) {
          queryToTree = this._makeVirtualFields(queryToTree, attribute.adapter!.field);
        }
      });

    link.fields.reduce((items, field) => {
      if (field.link) {

        field.link.fields
          .filter((field) => !field.link)
          .map((field) => {
            const attribute = field.attribute as ScalarAttribute;
            if (!link.entity.isIntervalTree && link.entity.isTree && queryToTree) {
              queryToTree = this._makeVirtualFields(queryToTree, attribute.adapter!.field);
            }
          });
      }
      return items;
    }, [] as string[]);

    return queryToTree;

  }

  private _makeSecondVirtualQuery(query: EntityQuery, withEquals?: boolean): EntityQuery {
    const virtualEntity = this._makeSecondVirtualEntity(query.link);

    const linkEntity = new EntityLink(virtualEntity, "parent", Object.values(virtualEntity!.attributes)
      .filter(value => value instanceof ScalarAttribute)
      .map(value => new EntityQueryField(value)));

    if (withEquals) {
      const equals: IEntityQueryWhereValue[] = [];
      equals.push({
        alias: "parent",
        attribute: linkEntity.entity.attribute("PARENT"),
        value: "11111"
      });
      const options = new EntityQueryOptions(undefined, undefined, [{equals}]);

      return new EntityQuery(linkEntity, options);
    }
    return new EntityQuery(linkEntity);
  }

  private _makeThirdVirtualQuery(query: EntityQuery, withEquals?: boolean): EntityQuery {
    const virtualEntity = this._makeThirdVirtualEntity(query.link);

    const linkEntity = new EntityLink(virtualEntity, "parent", Object.values(virtualEntity!.attributes)
      .filter(value => value instanceof ScalarAttribute)
      .map(value => new EntityQueryField(value)));

    if (withEquals) {
      const equals: IEntityQueryWhereValue[] = [];
      equals.push({
        alias: "parent",
        attribute: linkEntity.entity.attribute("PARENT"),
        value: "11111"
      });
      const options = new EntityQueryOptions(undefined, undefined, [{equals}]);

      return new EntityQuery(linkEntity, options);
    }
    return new EntityQuery(linkEntity);
  }

  private _makeSecondVirtualEntity(link: EntityLink): Entity {
    let query = new Entity({
      name: Builder._getOwnRelationName(link.entity),
      lName: {},
      adapter: {
        relation: [{relationName: Builder._getOwnRelationName(link.entity), pk: [Constants.DEFAULT_PARENT_KEY_NAME]}]
      }
    });

    query.add(new StringAttribute({
      name: Constants.DEFAULT_ID_NAME,
      lName: {},
      adapter: {
        relation: Builder._getOwnRelationName(query),
        field: Constants.DEFAULT_ID_NAME
      }
    }));
    query.add(new StringAttribute({
      name: Constants.DEFAULT_PARENT_KEY_NAME,
      lName: {},
      adapter: {
        relation: Builder._getOwnRelationName(query),
        field: Constants.DEFAULT_PARENT_KEY_NAME
      }
    }));

    link.fields
      .filter((field) => !field.link)
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        if (!link.entity.isIntervalTree && link.entity.isTree && query) {
          query = this._makeVirtualFields(query, attribute.adapter!.field);
        }
      });

    link.fields.reduce((items, field) => {
      if (field.link) {
        field.link.fields
          .filter((field) => !field.link)
          .map((field) => {
            const attribute = field.attribute as ScalarAttribute;
            if (!link.entity.isIntervalTree && link.entity.isTree && query) {
              query = this._makeVirtualFields(query, attribute.adapter!.field);
            }
          });
      }
      return items;
    }, [] as string[]);

    return query;
  }

  private _makeThirdVirtualEntity(link: EntityLink): Entity {
    let query = new Entity({
      name: Builder._getOwnRelationName(link.entity),
      lName: {},
      adapter: {
        relation: [{
          relationName: Builder._getOwnRelationName(link.entity),
          pk: [Constants.DEFAULT_PARENT_KEY_NAME]
        }, {
          relationName: "TREE",
          pk: [Constants.DEFAULT_ID_NAME]
        }]
      }
    });

    query.add(new StringAttribute({
      name: Constants.DEFAULT_ID_NAME,
      lName: {},
      adapter: {
        relation: query.adapter!.relation[0].relationName,
        field: Constants.DEFAULT_ID_NAME
      }
    }));
    query.add(new StringAttribute({
      name: Constants.DEFAULT_PARENT_KEY_NAME,
      lName: {},
      adapter: {
        relation: query.adapter!.relation[0].relationName,
        field: Constants.DEFAULT_PARENT_KEY_NAME
      }
    }));

    link.fields
      .filter((field) => !field.link)
      .map((field) => {
        const attribute = field.attribute as ScalarAttribute;
        if (!link.entity.isIntervalTree && link.entity.isTree && query) {
          query = this._makeVirtualFields(query, attribute.adapter!.field);
        }
      });

    link.fields.reduce((items, field) => {
      if (field.link) {

        field.link.fields
          .filter((field) => !field.link)
          .map((field) => {
            const attribute = field.attribute as ScalarAttribute;
            if (!link.entity.isIntervalTree && link.entity.isTree && query) {
              query = this._makeVirtualFields(query, attribute.adapter!.field);
            }
          });
      }
      return items;
    }, [] as string[]);
    return query;
  }

  private _makeVirtualFields(queryToTree: Entity, nameFields: string): Entity {
    const field = new StringAttribute({
      name: nameFields,
      required: true,
      lName: {},
      adapter: {"relation": queryToTree.name, "field": nameFields}
    });
    queryToTree.add(field);

    return queryToTree;
  }

  private _makeFrom(query: EntityQuery, first?: boolean): string {
    const {link} = query;

    const mainRelation = Select._getMainRelationName(link.entity);
    const from = link.entity.adapter!.relation.map((rel) => {
      if (rel.relationName == mainRelation.relationName) {

        if (!link.entity.isIntervalTree && link.entity.isTree && first) {

          const virtualTree =  this._query.link.fields
            .filter((field) => field.attribute.type === "Parent")
            .map((field) => {
         //   if (field.attribute.type === "Parent") {
              const virtualQuery = this._makeVirtualQuery(query);
              const virtualQuery2 = this._makeSecondVirtualQuery(query, true);
              const virtualQuery3 = this._makeThirdVirtualQuery(query, false);

              const mainRelation = Select._getMainRelationName(virtualQuery.link.entity);
              const from = virtualQuery.link.entity.adapter!.relation.map((rel) => {

                if (rel.relationName == mainRelation.relationName) {
                  const leftTableWithRecursive = this._getSelect(virtualQuery2, false, true);
                  const rightTableWithRecursive = this._getSelect(virtualQuery3, false, true);
                  const tableWithRecursive = this._getSelect(virtualQuery, false, true);

                  return SQLTemplates.fromWithTree(this._getTableAlias(field.link!, this._query.link.entity.name),
                    rel.relationName, leftTableWithRecursive, rightTableWithRecursive, tableWithRecursive);
                }
              });
              return from.join("\n");
            //}
         //   return SQLTemplates.from(this._getTableAlias(link, rel.relationName), rel.relationName);
          });
          if (virtualTree.length > 0) {
            return virtualTree
          }
        }
        return SQLTemplates.from(this._getTableAlias(link, rel.relationName), rel.relationName);
      } else {
        return SQLTemplates.join(
          rel.relationName,
          this._getTableAlias(link, rel.relationName),
          Select._getPKFieldName(link.entity, rel.relationName),
          this._getTableAlias(link, mainRelation.relationName),
          Select._getPKFieldName(link.entity, mainRelation.relationName),
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
            const attr = field.attribute as EntityAttribute;
            if (field.link.options && field.link.options.hasRoot) {
              joins.push(
                SQLTemplates.joinWithTree(
                  attr.adapter!.relation,
                  this._getTableAlias(field.link, attr.adapter!.relation),
                  Constants.DEFAULT_LB_NAME,
                  this._getTableAlias(link, attr.adapter!.relation),
                  Constants.DEFAULT_RB_NAME
                )
              );
            }
            if (linkFirstRelationName !== attr.adapter!.relation || !(field.link.options
              && field.link.options.hasRoot) && link.entity.isIntervalTree) {
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

            if (!field.link.entity.isIntervalTree && field.link.entity.isTree) {
              const forTreeQuery = new EntityQuery(field.link);

              const virtualQuery = this._makeVirtualQuery(forTreeQuery);
              const virtualQuery2 = this._makeSecondVirtualQuery(forTreeQuery, true);
              const virtualQuery3 = this._makeThirdVirtualQuery(forTreeQuery, false);

              const mainRelation = Select._getMainRelationName(virtualQuery.link.entity);
              const from = virtualQuery.link.entity.adapter!.relation.map((rel) => {

                if (rel.relationName == mainRelation.relationName) {
                  const leftTableWithRecursive = this._getSelect(virtualQuery2, false, true);
                  const rightTableWithRecursive = this._getSelect(virtualQuery3, false, true);
                  const tableWithRecursive = this._getSelect(virtualQuery, false, true);


                  const sqlText = SQLTemplates.joinWithSimpleTree(this._getTableAlias(field.link!, this._query.link.entity.name),
                    rel.relationName, leftTableWithRecursive, rightTableWithRecursive, tableWithRecursive);

                  const attr = field.attribute as EntityAttribute;
                  joins.push(
                    SQLTemplates.join(
                      sqlText,
                      this._getTableAlias(field.link!, linkFirstRelationName),
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
              this._getTableAlias(link, linkFirstRelationName),
              Select._getPKFieldName(field.link.entity, linkFirstRelationName),
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
          return SQLTemplates.equals(alias, equals.attribute.adapter!.field, this._addToParams(equals.value));
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
    if (this._query.options && this._query.options.order) {
      return this._query.options.order.reduce((orders, order) => {
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
      if (field.link) {
        const attribute = field.attribute as EntityAttribute;
        switch (attribute.type) {
          case "Parent": {
            if (attribute.adapter && attribute.adapter.relation === relationName) {
              return true;
            }
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
