import {Attribute} from "../model/Attribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {EntityLink} from "./EntityLink";
import {TValue} from "../types";
import {ERModel} from "../model/ERModel";

export interface IEntityQuerySetAliasInspector {
  alias: string;
  attribute?: string;
}

export interface IEntityQuerySetWhereValueInspector extends IEntityQuerySetAliasInspector {
  value: TValue | IEntityQuerySetAliasInspector;
}

export interface IEntityQuerySetWhereInspector {
  and?: IEntityQuerySetWhereInspector[];
  or?: IEntityQuerySetWhereInspector[];
  not?: IEntityQuerySetWhereInspector[];

  equals?: IEntityQuerySetWhereValueInspector[];
}

export interface IEntityQuerySetOptionsInspector {
  where?: IEntityQuerySetWhereInspector[];
}

export interface IEntityQuerySetAlias<Attr extends Attribute> {
  readonly alias: string;
  readonly attribute?: Attr;
}

export interface IEntityQuerySetWhereValue extends IEntityQuerySetAlias<ScalarAttribute> {
  readonly value: TValue | IEntityQuerySetAlias<ScalarAttribute>;
}

export interface IEntityQuerySetWhere {
  readonly and?: IEntityQuerySetWhere[];
  readonly or?: IEntityQuerySetWhere[];
  readonly not?: IEntityQuerySetWhere[];
  readonly equals?: IEntityQuerySetWhereValue[];
}

export interface IEntityQuerySet {
  link: EntityLink;
  options?: EntityQuerySetOptions;
}

export class EntityQuerySetOptions {

  public readonly where?: IEntityQuerySetWhere[];

  constructor(where?: IEntityQuerySetWhere[]) {
   this.where = where;
  }

  public static inspectorToObject(link: EntityLink,
                                  inspector: IEntityQuerySetOptionsInspector,
                                  erModel?: ERModel, existlLink?: EntityLink): EntityQuerySetOptions {
    return new EntityQuerySetOptions(
      inspector.where ?
        EntityQuerySetOptions.inspectorWhereToObject(link, inspector.where, erModel, existlLink) : undefined
    );
  }

  private static inspectorWhereToObject(link: EntityLink,
                                        inspector: IEntityQuerySetWhereInspector[],
                                        erModel?: ERModel,
                                        existlLink?: EntityLink): IEntityQuerySetWhere[] {
    return inspector.reduce((items, item) => {
      const where: IEntityQuerySetWhere = {
        and: item.and ? EntityQuerySetOptions.inspectorWhereToObject(link, item.and) : undefined,
        or: item.or ? EntityQuerySetOptions.inspectorWhereToObject(link, item.or) : undefined,
        not: item.not ? EntityQuerySetOptions.inspectorWhereToObject(link, item.not) : undefined,
        equals: item.equals
          ? item.equals.map((equals) => {
            const findLink = link.deepFindLink(equals.alias);
            if (!findLink) {
              throw new Error(`Alias ${equals.alias} is not found`);
            }
            if (!EntityQuerySetOptions._isValuePrimitiveInspector(equals.value)) {
                const findLink2 = link.deepFindLink(equals.value.alias) ?
                  link.deepFindLink(equals.value.alias) : existlLink && existlLink.deepFindLink(equals.value.alias);
                if (!findLink2) {
                  throw new Error(`Alias ${equals.value.alias} is not found`);
                }
                return {
                alias: equals.alias,
                attribute: equals.attribute ? findLink.entity.attribute(equals.attribute) : undefined,
                value: {
                  alias: equals.value.alias,
                  attribute: equals.value.attribute ? findLink2.entity.attribute(equals.value.attribute) : undefined }
              };
            }
            return {
              alias: equals.alias,
              attribute: equals.attribute ? findLink.entity.attribute(equals.attribute) : undefined,
              value: equals.value
            };
          })
          : undefined,
      };
      if (Object.values(where).some((w) => !!w)) {
        items.push(where);
      }
      return items;
    }, [] as IEntityQuerySetWhere[]);
  }

  private static _inspectWhere(where: IEntityQuerySetWhere[]): IEntityQuerySetWhereInspector[] {
    return where.reduce((items, item) => {
      const inspector: IEntityQuerySetWhereInspector = {};
      if (item.and) {
        inspector.and = EntityQuerySetOptions._inspectWhere(item.and);
      }
      if (item.or) {
        inspector.or = EntityQuerySetOptions._inspectWhere(item.or);
      }
      if (item.not) {
        inspector.not = EntityQuerySetOptions._inspectWhere(item.not);
      }
      if (item.equals) {
        inspector.equals = item.equals.map((equals) => {
          if (!EntityQuerySetOptions._isValuePrimitive(equals.value)) {
            return {
              alias: equals.alias,
              attribute: equals.attribute ? equals.attribute.name : undefined,
              value: {
                  alias: equals.value.alias,
                  attribute: equals.value.attribute ? equals.value.attribute.name : undefined
                }
            };
          }
          return {
            alias: equals.alias,
            attribute: equals.attribute ? equals.attribute.name : undefined,
            value: equals.value
          };
        });
      }

      items.push(inspector);
      return items;
    }, [] as IEntityQuerySetWhereInspector[]);
  }

  private static _isValuePrimitiveInspector(
    value: TValue | IEntityQuerySetAliasInspector
  ): value is TValue {
    return value !== Object(value);
  }

  private static _isValuePrimitive(value: TValue | IEntityQuerySetAlias<ScalarAttribute>): value is TValue {
    return value !== Object(value);
  }

  public inspect(): IEntityQuerySetOptionsInspector {
    const options: IEntityQuerySetOptionsInspector = {};
    if (this.where) {
      options.where = EntityQuerySetOptions._inspectWhere(this.where);
    }
    return options;
  }
}
