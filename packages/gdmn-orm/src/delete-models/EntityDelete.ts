import {Entity} from "../model/Entity";
import {ERModel} from "../model/ERModel";
import {TValue} from "../types";

export interface IEntityDeleteInspector {
  entity: string;
  pkValues: TValue[];
}

export class EntityDelete {

  public readonly entity: Entity;
  public readonly pkValues: TValue[];

  constructor(entity: Entity, pkValue: TValue[]) {
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
