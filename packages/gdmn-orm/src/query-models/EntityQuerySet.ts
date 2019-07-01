import {ERModel} from "../model/ERModel";
import {EntityLink, IEntityLinkInspector} from "./EntityLink";
import {EntityQuerySetOptions, IEntityQuerySetOptionsInspector} from "./EntityQuerySetOptions";

export interface IEntityQuerySetResponseFieldAlias {
  linkAlias: string;
  attribute: string;
  setAttribute?: string;
}

export interface IEntityQuerySetResponseFieldAliases {
  [alias: string]: IEntityQuerySetResponseFieldAlias;
}

export interface IEntityQuerySetResponseRow {
  [alias: string]: any;
}

export interface IEntityQuerySetResponse {
  data: IEntityQuerySetResponseRow[];
  aliases: IEntityQuerySetResponseFieldAliases;
  info: any;
}

export interface IEntityQuerySetInspector {
  link: IEntityLinkInspector;
  options?: IEntityQuerySetOptionsInspector;
}

export class EntityQuerySet {

  public readonly link: EntityLink;
  public readonly options?: EntityQuerySetOptions;

  constructor(query: EntityLink, options?: EntityQuerySetOptions) {
    this.link = query;
    this.options = options;
  }

  public static deserialize(erModel: ERModel, text: string): EntityQuerySet {
    return EntityQuerySet.inspectorToObject(erModel, JSON.parse(text));
  }

  public static inspectorToObject(erModel: ERModel,
                                  inspector: IEntityQuerySetInspector, existlLink?: EntityLink): EntityQuerySet {
    const link = EntityLink.inspectorToObject(erModel, inspector.link);
    const options = inspector.options &&
      EntityQuerySetOptions.inspectorToObject(link, inspector.options, erModel, existlLink);

    return new EntityQuerySet(link, options);
  }

  public serialize(): string {
    return JSON.stringify(this.inspect());
  }

  public inspect(): IEntityQuerySetInspector {
    const inspect: IEntityQuerySetInspector = {link: this.link.inspect()};
    if (this.options) {
      inspect.options = this.options.inspect();
    }
    return inspect;
  }
}
