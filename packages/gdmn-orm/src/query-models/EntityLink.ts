import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityQueryField, IEntityQueryFieldInspector} from "./EntityQueryField";

export interface IEntityLinkInspector {
  entity: string;
  alias: string;
  fields: IEntityQueryFieldInspector[];
  options?: IEntityLinkInspectorOptions;
}

export interface IEntityLinkInspectorOptions {
  hasRoot?: boolean;
}

export class EntityLink {

  public readonly entity: Entity;
  public readonly alias: string;
  public readonly fields: EntityQueryField[];
  public readonly options?: IEntityLinkInspectorOptions;

  constructor(entity: Entity, alias: string, fields: EntityQueryField[], options?: IEntityLinkInspectorOptions) {
    this.entity = entity;
    this.alias = alias;
    this.fields = fields;
    this.options = options;
  }

  public static inspectorToObject(erModel: ERModel, inspector: IEntityLinkInspector): EntityLink {
    const entity = erModel.entity(inspector.entity);
    const alias = inspector.alias;
    const fields = inspector.fields.map((inspectorField) => (
      EntityQueryField.inspectorToObject(erModel, entity, inspectorField)
    ));
    const options = inspector.options;

    return new EntityLink(entity, alias, fields, options);
  }

  public deepFindLink(alias: string): EntityLink | undefined;
  public deepFindLink(field: EntityQueryField): EntityLink | undefined;
  public deepFindLink(source: string | EntityQueryField): EntityLink | undefined {
    if (source instanceof EntityQueryField) {
      const find = this.fields
        .filter((qField) => !qField.link)
        .some((qField) => qField === source);

      if (find) {
        return this;
      }

      for (const qField of this.fields) {
        if (qField.link) {
          const findLink = qField.link.deepFindLink(source);
          if (findLink) {
            return findLink;
          }
        }
      }
    } else {
      if (this.alias === source) {
        return this;
      }
      for (const field of this.fields) {
        if (field.link) {
          const find = field.link.deepFindLink(source);
          if (find) {
            return find;
          }
        }
      }
    }
  }

  public inspect(): IEntityLinkInspector {
    return {
      entity: this.entity.name,
      alias: this.alias,
      fields: this.fields.map((field) => field.inspect()),
      options: this.options
    };
  }
}
