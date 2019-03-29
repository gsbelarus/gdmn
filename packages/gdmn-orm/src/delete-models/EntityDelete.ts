import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";

export interface IEntityDeleteInspector {
  entity: string;
  pkValues: any[];
}

export class EntityDelete {

  public readonly entity: Entity;
  public readonly pkValues: any[];

  constructor(entity: Entity, pkValue: any[]) {
    this.entity = entity;
    this.pkValues = pkValue;
  }

  public static deserialize(erModel: ERModel, text: string): EntityDelete {
    return EntityDelete.inspectorToObject(erModel, JSON.parse(text));
  }

  public static inspectorToObject(erModel: ERModel, inspector: IEntityDeleteInspector): EntityDelete {
    const entity = erModel.entity(inspector.entity);
    const pkValues = inspector.pkValues;

    return new EntityDelete(entity, pkValues);
  }

  public serialize(): string {
    return JSON.stringify(this.inspect());
  }

  public inspect(): IEntityDeleteInspector {
    return {
      entity: this.entity.name,
      pkValues: this.pkValues
    };
  }
}
