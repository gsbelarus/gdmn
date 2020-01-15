import {ERModel} from "../model/ERModel";
import {EntityLink, IEntityLinkInspector} from "./EntityLink";
import {EntityQueryOptions, IEntityQueryOptionsInspector, IEntityQueryWhere} from "./EntityQueryOptions";

export interface IEntityQueryResponseFieldAlias {
  linkAlias: string;
  attribute: string;
  setAttribute?: string;
}

export interface IEntityQueryResponseFieldAliases {
  [alias: string]: IEntityQueryResponseFieldAlias;
}

export interface IEntityQueryResponseRow {
  [alias: string]: any;
}

export interface IEntityQueryResponse {
  data: IEntityQueryResponseRow[];
  aliases: IEntityQueryResponseFieldAliases;
  info: any;
}

export interface IEntityQueryInspector {
  link: IEntityLinkInspector;
  options?: IEntityQueryOptionsInspector;
}

export class EntityQuery {

  public readonly link: EntityLink;
  private _options?: EntityQueryOptions;

  constructor(query: EntityLink, options?: EntityQueryOptions) {
    this.link = query;
    this._options = options;
  }

  public get options() {
    return this._options;
  }

  public static deserialize(erModel: ERModel, text: string): EntityQuery {
    return EntityQuery.inspectorToObject(erModel, JSON.parse(text));
  }

  public static inspectorToObject(erModel: ERModel,
                                  inspector: IEntityQueryInspector, existlLink?: EntityLink): EntityQuery {
    const link = EntityLink.inspectorToObject(erModel, inspector.link);
    const options = inspector.options &&
      EntityQueryOptions.inspectorToObject(link, inspector.options, erModel, existlLink);

    return new EntityQuery(link, options);
  }

  public serialize(): string {
    return JSON.stringify(this.inspect());
  }

  public inspect(): IEntityQueryInspector {
    const inspect: IEntityQueryInspector = {link: this.link.inspect()};
    if (this.options) {
      inspect.options = this.options.inspect();
    }
    return inspect;
  }

  public duplicate(erModel: ERModel): EntityQuery {
    return EntityQuery.inspectorToObject(erModel, this.inspect());
  }

  public addWhereCondition(cond: IEntityQueryWhere) {
    if (!this._options) {
      this._options = new EntityQueryOptions();
    }

    this._options.addWhereCondition(cond);
  }
}
