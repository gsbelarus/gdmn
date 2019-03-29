import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityUpdateField, IEntityUpdateFieldInspector} from "./EntityUpdateField";

export interface IEntityUpdateInspector {
  entity: string;
  fields: IEntityUpdateFieldInspector[];
  pkValues: number[];
}

export class EntityUpdate {

  public readonly entity: Entity;
  public readonly fields: EntityUpdateField[];
  public readonly pkValues: number[];

  constructor(entity: Entity, fields: EntityUpdateField[], pkValues: number[]) {
    this.entity = entity;
    this.fields = fields;
    this.pkValues = pkValues;
  }

  public static deserialize(erModel: ERModel, text: string): EntityUpdate {
    return EntityUpdate.inspectorToObject(erModel, JSON.parse(text));
  }

  public static inspectorToObject(erModel: ERModel, inspector: IEntityUpdateInspector): EntityUpdate {
    const entity = erModel.entity(inspector.entity);
    const fields = inspector.fields.map((inspectorField) => (
      EntityUpdateField.inspectorToObject(erModel, entity, inspectorField)
    ));

    return new EntityUpdate(entity, fields, inspector.pkValues);
  }

  public serialize(): string {
    return JSON.stringify(this.inspect());
  }

  public inspect(): IEntityUpdateInspector {
    return {
      entity: this.entity.name,
      fields: this.fields.map((field) => field.inspect()),
      pkValues: this.pkValues
    };
  }
}
