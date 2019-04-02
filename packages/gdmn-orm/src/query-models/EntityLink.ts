import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityLinkField, IEntityLinkFieldInspector} from "./EntityLinkField";

export interface IEntityLinkInspector {
  entity: string;
  alias: string;
  fields: IEntityLinkFieldInspector[];
  options?: IEntityLinkInspectorOptions;
}

export interface IEntityLinkInspectorOptions {
  hasRoot?: boolean;
}

export class EntityLink {

  public readonly entity: Entity;
  public readonly alias: string;
  public readonly fields: EntityLinkField[];
  public readonly options?: IEntityLinkInspectorOptions;

  constructor(entity: Entity, alias: string, fields: EntityLinkField[], options?: IEntityLinkInspectorOptions) {
    this.entity = entity;
    this.alias = alias;
    this.fields = fields;
    this.options = options;
  }

  public static inspectorToObject(erModel: ERModel, inspector: IEntityLinkInspector): EntityLink {
    const entity = erModel.entity(inspector.entity);
    const alias = inspector.alias;
    const fields = inspector.fields.map((inspectorField) => (
      EntityLinkField.inspectorToObject(erModel, entity, inspectorField)
    ));
    const options = inspector.options;

    return new EntityLink(entity, alias, fields, options);
  }

  public deepFindLink(alias: string): EntityLink | undefined;
  public deepFindLink(field: EntityLinkField): EntityLink | undefined;
  public deepFindLink(source: string | EntityLinkField): EntityLink | undefined {
    if (source instanceof EntityLinkField) {
      if (this.fields.some((qField) => qField === source)) {
        return this;
      }
      for (const field of this.fields) {
        if (field.links) {
          for (const link of field.links) {
            const find = link.deepFindLink(source);
            if (find) {
              return find;
            }
          }
        }
      }
    } else {
      if (this.alias === source) {
        return this;
      }
      for (const field of this.fields) {
        if (field.links) {
          for (const link of field.links) {
            const find = link.deepFindLink(source);
            if (find) {
              return find;
            }
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
