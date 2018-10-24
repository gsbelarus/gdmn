import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityQueryField, IEntityQueryFieldInspector} from "./EntityQueryField";

export interface IEntityLinkInspector {
  entity: string;
  alias: string;
  fields: IEntityQueryFieldInspector[];
}

export class EntityLink {

  public entity: Entity;
  public alias: string;
  public fields: EntityQueryField[];

  constructor(entity: Entity, alias: string, fields: EntityQueryField[]) {
    this.entity = entity;
    this.alias = alias;
    this.fields = fields;
  }

  public static inspectorToObject(erModel: ERModel, inspector: IEntityLinkInspector): EntityLink {
    const entity = erModel.entity(inspector.entity);
    const alias = inspector.alias;
    const fields = inspector.fields.map((inspectorField) => (
      EntityQueryField.inspectorToObject(erModel, entity, inspectorField)
    ));

    return new EntityLink(entity, alias, fields);
  }

  public deepFindLinkByField(field: EntityQueryField): EntityLink | undefined {
    const find = this.fields
      .filter((qField) => !qField.link)
      .some((qField) => qField === field);

    if (find) {
      return this;
    }

    for (const qField of this.fields) {
      if (qField.link) {
        const findLink = qField.link.deepFindLinkByField(field);
        if (findLink) {
          return findLink;
        }
      }
    }
  }

  public deepFindLinkByAlias(alias: string): EntityLink | undefined {
    if (this.alias === alias) {
      return this;
    }
    for (const field of this.fields) {
      if (field.link) {
        const find = field.link.deepFindLinkByAlias(alias);
        if (find) {
          return find;
        }
      }
    }
  }

  public inspect(): IEntityLinkInspector {
    return {
      entity: this.entity.name,
      alias: this.alias,
      fields: this.fields.map((field) => field.inspect())
    };
  }
}
