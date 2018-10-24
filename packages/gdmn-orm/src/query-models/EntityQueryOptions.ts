import {Attribute} from "../model/Attribute";
import {EntityLink} from "./EntityLink";

export interface IEntityQueryWhereInspector {
  not?: IEntityQueryWhereInspector;
  or?: IEntityQueryWhereInspector;
  and?: IEntityQueryWhereInspector;

  isNull?: IEntityLinkAlias<string>;
  equals?: IEntityLinkAlias<{ [fieldName: string]: any }>;
  greater?: IEntityLinkAlias<{ [fieldName: string]: any }>;
  less?: IEntityLinkAlias<{ [fieldName: string]: any }>;
}

export interface IEntityQueryOptionsInspector {
  first?: number;
  skip?: number;
  where?: IEntityQueryWhereInspector;
  order?: IEntityLinkAlias<{ [fieldName: string]: string }>;
}

export interface IEntityQueryWhere {
  not?: IEntityQueryWhere;
  or?: IEntityQueryWhere;
  and?: IEntityQueryWhere;

  isNull?: IEntityLinkAlias<Attribute>;
  equals?: IEntityLinkAlias<Map<Attribute, any>>;
  greater?: IEntityLinkAlias<Map<Attribute, any>>;
  less?: IEntityLinkAlias<Map<Attribute, any>>;
}

export interface IEntityLinkAlias<V> {
  [alias: string]: V;
}

export enum EntityQueryOrder {
  ASC = "asc",
  DESC = "desc"
}

export class EntityQueryOptions {

  public first?: number;
  public skip?: number;
  public where?: IEntityQueryWhere;
  public order?: IEntityLinkAlias<Map<Attribute, EntityQueryOrder>>;

  constructor(first?: number,
              skip?: number,
              where?: IEntityQueryWhere,
              order?: IEntityLinkAlias<Map<Attribute, EntityQueryOrder>>) {
    this.first = first;
    this.skip = skip;
    this.where = where;
    this.order = order;
  }

  public static inspectorToObject(link: EntityLink, inspector: IEntityQueryOptionsInspector): EntityQueryOptions {
    return new EntityQueryOptions(
      inspector.first,
      inspector.skip,
      EntityQueryOptions.inspectorWhereToObject(link, inspector.where),
      EntityQueryOptions._inspectorToObjectMap(link, inspector.order)
    );
  }

  private static inspectorWhereToObject(link: EntityLink,
                                        inspector?: IEntityQueryWhereInspector): IEntityQueryWhere | undefined {
    if (inspector) {
      const where: IEntityQueryWhere = {};

      const not = EntityQueryOptions.inspectorWhereToObject(link, inspector.not);
      if (not) {
        where.not = not;
      }
      const or = EntityQueryOptions.inspectorWhereToObject(link, inspector.or);
      if (or) {
        where.or = or;
      }
      const and = EntityQueryOptions.inspectorWhereToObject(link, inspector.and);
      if (and) {
        where.and = and;
      }

      if (inspector.isNull) {
        const isNull = Object.entries(inspector.isNull).reduce((aliases, [alias, value]) => {
          const findLink = link.deepFindLinkByAlias(alias);
          if (!findLink) {
            throw new Error("Alias not found");
          }
          aliases[alias] = findLink.entity.attribute(value);
          return aliases;
        }, {} as IEntityLinkAlias<Attribute>);
        if (Object.keys(isNull).length) {
          where.isNull = isNull;
        }
      }
      const equals = EntityQueryOptions._inspectorToObjectMap(link, inspector.equals);
      if (equals) {
        where.equals = equals;
      }
      const greater = EntityQueryOptions._inspectorToObjectMap(link, inspector.greater);
      if (greater) {
        where.greater = greater;
      }
      const less = EntityQueryOptions._inspectorToObjectMap(link, inspector.less);
      if (less) {
        where.less = less;
      }
      return where;
    }
  }

  private static _inspectorToObjectMap(
    link: EntityLink,
    map?: IEntityLinkAlias<{ [fieldName: string]: any }>
  ): IEntityLinkAlias<Map<Attribute, any>> {
    if (map) {
      return Object.entries(map)
        .reduce((aliases, [alias, condition]) => {
          const findLink = link.deepFindLinkByAlias(alias);
          if (!findLink) {
            throw new Error("Alias not found");
          }
          aliases[alias] = Object.entries(condition)
            .reduce((newMap, [key, value]) => {
              newMap.set(findLink.entity.attribute(key), value);
              return newMap;
            }, new Map<Attribute, any>());

          return aliases;
        }, {} as IEntityLinkAlias<Map<Attribute, any>>);
    }
    return {};
  }

  private static _inspectMap(map?: IEntityLinkAlias<Map<Attribute, any>>): { [fieldName: string]: any } {
    if (map) {
      return Object.entries(map).reduce((aliases, [alias, condition]) => {
        const newMap: { [fieldName: string]: any } = {};
        for (const [key, value] of condition.entries()) {
          newMap[key.name] = value;
        }
        aliases[alias] = newMap;
        return aliases;
      }, {} as IEntityLinkAlias<{ [fieldName: string]: any }>);
    }
    return {};
  }

  private static _inspectWhere(where?: IEntityQueryWhere): IEntityQueryWhereInspector | undefined {
    if (where) {
      const inspector: IEntityQueryWhereInspector = {};
      if (where.not) {
        inspector.not = this._inspectWhere(where.not);
      }
      if (where.or) {
        inspector.or = this._inspectWhere(where.or);
      }
      if (where.and) {
        inspector.and = this._inspectWhere(where.and);
      }
      if (where.isNull) {
        inspector.isNull = Object.entries(where.isNull).reduce((isNull, [alias, value]) => {
          isNull[alias] = value.name;
          return isNull;
        }, {} as IEntityLinkAlias<string>);
      }
      const equals = EntityQueryOptions._inspectMap(where.equals);
      if (Object.keys(equals).length) {
        inspector.equals = equals;
      }
      const greater = EntityQueryOptions._inspectMap(where.greater);
      if (Object.keys(greater).length) {
        inspector.greater = greater;
      }
      const less = EntityQueryOptions._inspectMap(where.less);
      if (Object.keys(less).length) {
        inspector.less = less;
      }
      return inspector;
    }
  }

  public inspect(): IEntityQueryOptionsInspector {
    const options: IEntityQueryOptionsInspector = {};
    if (this.first !== undefined) {
      options.first = this.first;
    }
    if (this.skip !== undefined) {
      options.skip = this.skip;
    }
    const where = EntityQueryOptions._inspectWhere(this.where);
    if (where) {
      options.where = where;
    }
    const order = EntityQueryOptions._inspectMap(this.order);
    if (order) {
      options.order = order;
    }
    return options;
  }
}
