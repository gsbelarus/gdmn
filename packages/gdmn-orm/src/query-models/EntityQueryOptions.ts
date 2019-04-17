import {Attribute} from "../model/Attribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {EntityLink} from "./EntityLink";
import {TValue} from "../types";
import {EntityQuery, ERModel, IEntityQueryInspector} from "..";

export interface IEntityQueryAliasInspector {
  alias: string;
  attribute: string;
}

export interface IEntityQueryWhereBetweenValueInspector {
  leftValue: TValue;
  rightValue: TValue;
}

export interface IEntityQueryWhereValueInspector extends IEntityQueryAliasInspector {
  value: TValue | IEntityQueryAliasInspector;
}

export interface IEntityQueryWhereValueNumberInspector extends IEntityQueryAliasInspector {
  value: number;
}

export interface IEntityQueryWhereValueStringInspector extends IEntityQueryAliasInspector {
  value: string;
}

export interface IEntityQueryWhereValueObjectInspector extends IEntityQueryAliasInspector {
  value: IEntityQueryWhereBetweenValueInspector;
}

export interface IEntityQueryWhereInspector {
  and?: IEntityQueryWhereInspector[];
  or?: IEntityQueryWhereInspector[];
  not?: IEntityQueryWhereInspector[];

  isNull?: IEntityQueryAliasInspector[];
  equals?: IEntityQueryWhereValueInspector[];
  contains?: IEntityQueryWhereValueInspector[];
  greater?: IEntityQueryWhereValueNumberInspector[];
  less?: IEntityQueryWhereValueNumberInspector[];
  startingWith?: IEntityQueryWhereValueStringInspector[];
  exist?: IEntityQueryInspector[];
  between?: IEntityQueryWhereValueObjectInspector[];
  like?: IEntityQueryWhereValueInspector[];
}

export interface IEntityQueryOrderInspector extends IEntityQueryAliasInspector {
  type?: EntityQueryOrderType;
}

export interface IEntityQueryOptionsInspector {
  first?: number;
  skip?: number;
  where?: IEntityQueryWhereInspector[];
  order?: IEntityQueryOrderInspector[];
}

export type EntityQueryOrderType = "ASC" | "DESC";

export interface IEntityQueryAlias<Attr extends Attribute> {
  readonly alias: string;
  readonly attribute: Attr;
}

export interface IEntityQueryWhereValue extends IEntityQueryAlias<ScalarAttribute> {
  readonly value: TValue | IEntityQueryAlias<ScalarAttribute>;
}

export interface IEntityQueryWhereValueNumber extends IEntityQueryAlias<ScalarAttribute> {
  readonly value: number;
}

export interface IEntityQueryWhereValueString extends IEntityQueryAlias<ScalarAttribute> {
  readonly value: string;
}

export interface IEntityQueryWhereValueObject extends IEntityQueryAlias<ScalarAttribute> {
  readonly value: IEntityQueryWhereBetweenValue;
}

export interface IEntityQueryWhereBetweenValue {
  leftValue: TValue;
  rightValue: TValue;
}

export interface IEntityQueryWhere {
  readonly and?: IEntityQueryWhere[];
  readonly or?: IEntityQueryWhere[];
  readonly not?: IEntityQueryWhere[];

  readonly isNull?: Array<IEntityQueryAlias<ScalarAttribute>>;
  readonly equals?: IEntityQueryWhereValue[];
  readonly contains?: IEntityQueryWhereValue[];
  readonly greater?: IEntityQueryWhereValueNumber[];
  readonly less?: IEntityQueryWhereValueNumber[];
  readonly startingWith?: IEntityQueryWhereValueString[];
  readonly exist?: IEntityQueryWhereExist[];
  readonly between?: IEntityQueryWhereValueObject[];
  readonly like?: IEntityQueryWhereValue[];
}

export interface IEntityQueryOrder extends IEntityQueryAlias<ScalarAttribute> {
  readonly type?: EntityQueryOrderType;
}

export interface IEntityQueryWhereExist {
  link: EntityLink;
  options?: EntityQueryOptions;
}

export class EntityQueryOptions {

  public readonly first?: number;
  public readonly skip?: number;
  public readonly where?: IEntityQueryWhere[];
  public readonly order?: IEntityQueryOrder[];

  constructor(first?: number,
              skip?: number,
              where?: IEntityQueryWhere[],
              order?: IEntityQueryOrder[]) {
    this.first = first;
    this.skip = skip;
    this.where = where;
    this.order = order;
  }

  public static inspectorToObject(link: EntityLink,
                                  inspector: IEntityQueryOptionsInspector,
                                  erModel?: ERModel, existlLink?: EntityLink): EntityQueryOptions {
    return new EntityQueryOptions(
      inspector.first,
      inspector.skip,
      inspector.where ?
        EntityQueryOptions.inspectorWhereToObject(link, inspector.where, erModel, existlLink) : undefined,
      inspector.order ? inspector.order.map((opt) => {
        const findLink = link.deepFindLink(opt.alias);
        if (!findLink) {
          throw new Error(`Alias ${opt.alias} is not found`);
        }
        return {
          alias: opt.alias,
          attribute: findLink.entity.attribute(opt.attribute),
          type: opt.type
        };
      }) : undefined
    );
  }

  private static inspectorWhereToObject(link: EntityLink,
                                        inspector: IEntityQueryWhereInspector[],
                                        erModel?: ERModel,
                                        existlLink?: EntityLink): IEntityQueryWhere[] {
    return inspector.reduce((items, item) => {
      const where: IEntityQueryWhere = {
        and: item.and ? EntityQueryOptions.inspectorWhereToObject(link, item.and) : undefined,
        or: item.or ? EntityQueryOptions.inspectorWhereToObject(link, item.or) : undefined,
        not: item.not ? EntityQueryOptions.inspectorWhereToObject(link, item.not) : undefined,
        isNull: item.isNull
          ? item.isNull.map((isNull) => {
            const findLink = link.deepFindLink(isNull.alias);
            if (!findLink) {
              throw new Error(`Alias ${isNull.alias} is not found`);
            }
            return {
              alias: isNull.alias,
              attribute: findLink.entity.attribute(isNull.attribute)
            };
          })
          : undefined,
        equals: item.equals
          ? item.equals.map((equals) => {
            const findLink = link.deepFindLink(equals.alias);
            if (!findLink) {
              throw new Error(`Alias ${equals.alias} is not found`);
            }
            if (!EntityQueryOptions._isValuePrimitiveInspector(equals.value)) {
                const findLink2 = link.deepFindLink(equals.value.alias) ?
                  link.deepFindLink(equals.value.alias) : existlLink && existlLink.deepFindLink(equals.value.alias);
                if (!findLink2) {
                  throw new Error(`Alias ${equals.value.alias} is not found`);
                }
                return {
                alias: equals.alias,
                attribute: findLink.entity.attribute(equals.attribute),
                value: {alias: equals.value.alias, attribute: findLink2.entity.attribute(equals.value.attribute)}
              };
            }
            return {
              alias: equals.alias,
              attribute: findLink.entity.attribute(equals.attribute),
              value: equals.value
            };
          })
          : undefined,
        contains: item.contains
          ? item.contains.map((contains) => {
            const findLink = link.deepFindLink(contains.alias);
            if (!findLink) {
              throw new Error(`Alias ${contains.alias} is not found`);
            }
            if (!EntityQueryOptions._isValuePrimitiveInspector(contains.value)) {
              const findLink2 = link.deepFindLink(contains.value.alias) ?
                link.deepFindLink(contains.value.alias) : existlLink && existlLink.deepFindLink(contains.value.alias);
              if (!findLink2) {
                throw new Error(`Alias ${contains.value.alias} is not found`);
              }
              return {
                alias: contains.alias,
                attribute: findLink.entity.attribute(contains.attribute),
                value: {alias: contains.value.alias, attribute: findLink2.entity.attribute(contains.value.attribute)}
              };
            }
            return {
              alias: contains.alias,
              attribute: findLink.entity.attribute(contains.attribute),
              value: contains.value
            };
          })
          : undefined,
        greater: item.greater
          ? item.greater.map((greater) => {
            if (typeof greater.value !== "number") {
              throw new Error(`Value ${greater.value} must have type number`);
            }
            const findLink = link.deepFindLink(greater.alias);
            if (!findLink) {
              throw new Error(`Alias ${greater.alias} is not found`);
            }
            return {
              alias: greater.alias,
              attribute: findLink.entity.attribute(greater.attribute),
              value: greater.value
            };
          })
          : undefined,
        less: item.less
          ? item.less.map((less) => {
            if (typeof less.value !== "number") {
              throw new Error(`Value ${less.value} must have type number`);
            }
            const findLink = link.deepFindLink(less.alias);
            if (!findLink) {
              throw new Error(`Alias ${less.alias} is not found`);
            }
            return {
              alias: less.alias,
              attribute: findLink.entity.attribute(less.attribute),
              value: less.value
            };
          })
          : undefined,
        startingWith: item.startingWith
          ? item.startingWith.map((startingWith) => {
            if (typeof startingWith.value !== "string") {
              throw new Error(`Value ${startingWith.value} must have type string`);
            }
            const findLink = link.deepFindLink(startingWith.alias);
            if (!findLink) {
              throw new Error(`Alias ${startingWith.alias} is not found`);
            }
            return {
              alias: startingWith.alias,
              attribute: findLink.entity.attribute(startingWith.attribute),
              value: startingWith.value
            };
          })
          : undefined,
        exist: item.exist
          ? item.exist.map((exist) => {
            const inspectorEntityQuery: IEntityQueryInspector = {
              link: exist.link,
              options: exist.options
            };
            return EntityQuery.inspectorToObject(erModel!, inspectorEntityQuery, link);
          })
          : undefined,
        between: item.between
          ? item.between.map((between) => {

            const findLink = link.deepFindLink(between.alias);
            if (!findLink) {
              throw new Error(`Alias ${between.alias} is not found`);
            }

            return {
              alias: between.alias,
              attribute: findLink.entity.attribute(between.attribute),
              value: between.value
            };
          })
          : undefined,
        like: item.like
          ? item.like.map((like) => {
            const findLink = link.deepFindLink(like.alias);
            if (!findLink) {
              throw new Error(`Alias ${like.alias} is not found`);
            }
            if (!EntityQueryOptions._isValuePrimitiveInspector(like.value)) {
              throw new Error(`Value ${like.value} should be primitive type`);
            }
            return {
              alias: like.alias,
              attribute: findLink.entity.attribute(like.attribute),
              value: like.value
            };
          })
          : undefined
      };
      if (Object.values(where).some((w) => !!w)) {
        items.push(where);
      }
      return items;
    }, [] as IEntityQueryWhere[]);
  }

  private static _inspectWhere(where: IEntityQueryWhere[]): IEntityQueryWhereInspector[] {
    return where.reduce((items, item) => {
      const inspector: IEntityQueryWhereInspector = {};
      if (item.and) {
        inspector.and = EntityQueryOptions._inspectWhere(item.and);
      }
      if (item.or) {
        inspector.or = EntityQueryOptions._inspectWhere(item.or);
      }
      if (item.not) {
        inspector.not = EntityQueryOptions._inspectWhere(item.not);
      }

      if (item.isNull) {
        inspector.isNull = item.isNull.map((isNull) => ({
          alias: isNull.alias,
          attribute: isNull.attribute.name
        }));
      }
      if (item.equals) {
        inspector.equals = item.equals.map((equals) => {
          if (!EntityQueryOptions._isValuePrimitive(equals.value)) {
            return {
              alias: equals.alias,
              attribute: equals.attribute.name,
              value: {
                  alias: equals.value.alias,
                  attribute: equals.value.attribute.name
                }
            };
          }
          return {
            alias: equals.alias,
            attribute: equals.attribute.name,
            value: equals.value
          };
        });
      }
      if (item.contains) {
        inspector.contains = item.contains.map((contains) => {
          if (!EntityQueryOptions._isValuePrimitive(contains.value)) {
            return {
              alias: contains.alias,
              attribute: contains.attribute.name,
              value: {
                alias: contains.value.alias,
                attribute: contains.value.attribute.name
              }
            };
          }
          return {
            alias: contains.alias,
            attribute: contains.attribute.name,
            value: contains.value
          };
        });
      }
      if (item.greater) {
        inspector.greater = item.greater.map((greater) => ({
          alias: greater.alias,
          attribute: greater.attribute.name,
          value: greater.value
        }));
      }
      if (item.less) {
        inspector.less = item.less.map((less) => ({
          alias: less.alias,
          attribute: less.attribute.name,
          value: less.value
        }));
      }
      if (item.startingWith) {
        inspector.startingWith = item.startingWith.map((startingWith) => ({
          alias: startingWith.alias,
          attribute: startingWith.attribute.name,
          value: startingWith.value
        }));
      }
      if (item.exist) {
        inspector.exist = item.exist.map((exist) => ({
          link: exist.link.inspect(),
          options: exist.options && exist.options.inspect()
        }));
      }
      if (item.between) {
        inspector.between = item.between.map((between) => ({
          alias: between.alias,
          attribute: between.attribute.name,
          value: between.value
        }));
      }
      if (item.like) {
        inspector.like = item.like.map((like) => {
          if (!EntityQueryOptions._isValuePrimitive(like.value)) {
            throw new Error(`Value ${like.value} should be primitive type`);
          }
          return {
            alias: like.alias,
            attribute: like.attribute.name,
            value: like.value
          };
        });
      }

      items.push(inspector);
      return items;
    }, [] as IEntityQueryWhereInspector[]);
  }

  private static _isValuePrimitiveInspector(
    value: TValue | IEntityQueryAliasInspector
  ): value is TValue {
    return value !== Object(value);
  }

  private static _isValuePrimitive(value: TValue | IEntityQueryAlias<ScalarAttribute>): value is TValue {
    return value !== Object(value);
  }

  public inspect(): IEntityQueryOptionsInspector {
    const options: IEntityQueryOptionsInspector = {};
    if (this.first !== undefined) {
      options.first = this.first;
    }
    if (this.skip !== undefined) {
      options.skip = this.skip;
    }
    if (this.where) {
      options.where = EntityQueryOptions._inspectWhere(this.where);
    }
    if (this.order) {
      options.order = this.order.map((opt) => ({
        alias: opt.alias,
        attribute: opt.attribute.name,
        type: opt.type
      }));
    }
    return options;
  }
}
