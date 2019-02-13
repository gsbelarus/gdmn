import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityInsertField, IEntityInsertFieldInspector} from "./EntityInsertField";

export interface IEntityInsertInspector {
  entity: string;
  fields: IEntityInsertFieldInspector[];
}

export class EntityInsert {

  public readonly entity: Entity;
  public readonly fields: EntityInsertField[];

  constructor(entity: Entity, fields: EntityInsertField[]) {
    this.entity = entity;
    this.fields = fields;
  }

  public static inspectorToObject(erModel: ERModel, inspector: IEntityInsertInspector): EntityInsert {
    const entity = erModel.entity(inspector.entity);

    const fields = inspector.fields.map((inspectorField) => (
      EntityInsertField.inspectorToObject(erModel, entity, inspectorField)
    ));
    return new EntityInsert(entity, fields);
  }

  public deepFindLink(field: EntityInsertField): EntityInsert | undefined {
    const find = this.fields.some((qField) => qField === field);

    if (find) {
      return this;
    }
  }

  public inspect(): IEntityInsertInspector {
    return {
      entity: this.entity.name,
      fields: this.fields.map((field) => field.inspect())
    };
  }
}
