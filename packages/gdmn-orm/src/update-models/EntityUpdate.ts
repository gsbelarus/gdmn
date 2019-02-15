import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {EntityUpdateField, IEntityUpdateFieldInspector} from "./EntityUpdateField";

export interface IEntityUpdateInspector {
  entity: string;
  fields: IEntityUpdateFieldInspector[];
  pkValue: number;
}

export class EntityUpdate {

  public readonly entity: Entity;
  public readonly fields: EntityUpdateField[];
  public readonly pkValue: number;

  constructor(entity: Entity, fields: EntityUpdateField[], pkValue: number) {
    this.entity = entity;
    this.fields = fields;
    this.pkValue = pkValue;
  }

  public static deserialize(erModel: ERModel, text: string): EntityUpdate {
    return EntityUpdate.inspectorToObject(erModel, JSON.parse(text));
  }

  public static inspectorToObject(erModel: ERModel, inspector: IEntityUpdateInspector): EntityUpdate {

    const entity = erModel.entity(inspector.entity);
    const fields = inspector.fields.map((inspectorField) => (
      EntityUpdateField.inspectorToObject(erModel, entity, inspectorField)
    ));
    const pkValue = inspector.pkValue;

    return new EntityUpdate(entity, fields, pkValue);
  }

  public serialize(): string {
    return JSON.stringify(this.inspect());
  }

  public inspect(): IEntityUpdateInspector {
    return {
      entity: this.entity.name,
      fields: this.fields.map((field) => field.inspect()),
      pkValue: this.pkValue
    };
  }
}
