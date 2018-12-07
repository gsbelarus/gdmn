import {Attribute} from "../model/Attribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {EntityLink} from "./EntityLink";

export interface IEntityQueryAliasInspector {
  alias: string;
  attribute: string;
}

export interface IEntityQueryWhereValueInspector extends IEntityQueryAliasInspector {
  value: any;
}

export interface IEntityQueryWhereInspector {
  and?: IEntityQueryWhereInspector[];
  or?: IEntityQueryWhereInspector[];
  not?: IEntityQueryWhereInspector[];

  isNull?: IEntityQueryAliasInspector[];
  equals?: IEntityQueryWhereValueInspector[];
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
  alias: string;
  attribute: Attr;
}

export interface IEntityQueryWhereValue extends IEntityQueryAlias<ScalarAttribute> {
  value: any;
}

export interface IEntityQueryWhere {
  and?: IEntityQueryWhere[];
  or?: IEntityQueryWhere[];
  not?: IEntityQueryWhere[];

  isNull?: Array<IEntityQueryAlias<ScalarAttribute>>;
  equals?: IEntityQueryWhereValue[];
}

export interface IEntityQueryOrder extends IEntityQueryAlias<ScalarAttribute> {
  type?: EntityQueryOrderType;
}

export class EntityQueryOptions {

  public first?: number;
  public skip?: number;
  public where?: IEntityQueryWhere[];
  public order?: IEntityQueryOrder[];

  constructor(first?: number,
              skip?: number,
              where?: IEntityQueryWhere[],
              order?: IEntityQueryOrder[]) {
    this.first = first;
    this.skip = skip;
    this.where = where;
    this.order = order;
  }

  public static inspectorToObject(link: EntityLink, inspector: IEntityQueryOptionsInspector): EntityQueryOptions {
    return new EntityQueryOptions(
      inspector.first,
      inspector.skip,
      inspector.where ? EntityQueryOptions.inspectorWhereToObject(link, inspector.where) : undefined,
      inspector.order ? inspector.order.map((opt) => ({
        alias: opt.alias,
        attribute: EntityQueryOptions._getLink(link, opt.alias).entity.attribute(opt.attribute),
        type: opt.type
      })) : undefined
    );
  }

  private static inspectorWhereToObject(link: EntityLink,
                                        inspector: IEntityQueryWhereInspector[]): IEntityQueryWhere[] {
    return inspector.reduce((items, item) => {
      const where: IEntityQueryWhere = {};
      if (item.and) {
        where.and = EntityQueryOptions.inspectorWhereToObject(link, item.and);
      }
      if (item.or) {
        where.or = EntityQueryOptions.inspectorWhereToObject(link, item.or);
      }
      if (item.not) {
        where.not = EntityQueryOptions.inspectorWhereToObject(link, item.not);
      }

      if (item.isNull) {
        where.isNull = item.isNull.map((isNull) => {
          const findLink = link.deepFindLink(isNull.alias);
          if (!findLink) {
            throw new Error("Alias not found");
          }
          return {
            alias: isNull.alias,
            attribute: EntityQueryOptions._getLink(link, isNull.alias).entity.attribute(isNull.attribute)
          };
        });
      }
      if (item.equals) {
        where.equals = item.equals.map((equals) => {
          const findLink = link.deepFindLink(equals.alias);
          if (!findLink) {
            throw new Error("Alias not found");
          }
          return {
            alias: equals.alias,
            attribute: EntityQueryOptions._getLink(link, equals.alias).entity.attribute(equals.attribute),
            value: equals.value
          };
        });
      }

      items.push(where);
      return items;
    }, [] as IEntityQueryWhere[]);
  }

  private static _getLink(link: EntityLink, alias: string): EntityLink {
    const findLink = link.deepFindLink(alias);
    if (!findLink) {
      throw new Error("Alias not found");
    }
    return findLink;
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
        inspector.equals = item.equals.map((equals) => ({
          alias: equals.alias,
          attribute: equals.attribute.name,
          value: equals.value
        }));
      }
      items.push(inspector);
      return items;
    }, [] as IEntityQueryWhereInspector[]);
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
