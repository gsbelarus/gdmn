import {Attribute} from "../model/Attribute";
import {ScalarAttribute} from "../model/scalar/ScalarAttribute";
import {EntityLink} from "./EntityLink";
import {TValue} from "../types";
import {ERModel} from "../model/ERModel";

export interface IEntityQuerySetAliasInspector {
  alias: string;
}

export interface IEntityQuerySetWhereValueInspector extends IEntityQuerySetAliasInspector {
  value: TValue;
}

export interface IEntityQuerySetWhereInspector {
  equals?: IEntityQuerySetWhereValueInspector[];
}

export interface IEntityQuerySetOptionsInspector {
  where?: IEntityQuerySetWhereInspector[];
}

export interface IEntityQuerySetAlias<Attr extends Attribute> {
  readonly alias: string;
}

export interface IEntityQuerySetWhereValue extends IEntityQuerySetAlias<ScalarAttribute> {
  readonly value: TValue;
}

export interface IEntityQuerySetWhere {
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
        equals: item.equals
          ? item.equals.map((equals) => {
            const findLink = link.deepFindLink(equals.alias);
            if (!findLink) {
              throw new Error(`Alias ${equals.alias} is not found`);
            }
            return {
              alias: equals.alias,
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
      if (item.equals) {
        inspector.equals = item.equals.map((equals) => {
          return {
            alias: equals.alias,
            value: equals.value
          };
        });
      }

      items.push(inspector);
      return items;
    }, [] as IEntityQuerySetWhereInspector[]);
  }

  public inspect(): IEntityQuerySetOptionsInspector {
    const options: IEntityQuerySetOptionsInspector = {};
    if (this.where) {
      options.where = EntityQuerySetOptions._inspectWhere(this.where);
    }
    return options;
  }
}
