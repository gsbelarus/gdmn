import {IAttributeAdapter} from "../../rdbadapter";
import {IEntityAttribute} from "../../serialize";
import {AttributeTypes} from "../../types";
import {Attribute, IAttributeOptions} from "../Attribute";
import {Entity} from "../Entity";

export interface IEntityAttributeOptions<Adapter = IAttributeAdapter> extends IAttributeOptions<Adapter> {
  entities: Entity[];
}

export class EntityAttribute<Adapter = IAttributeAdapter> extends Attribute<Adapter> {

  public type: AttributeTypes = "Entity";

  public readonly entities: Entity[];

  constructor(options: IEntityAttributeOptions<Adapter>) {
    super(options);
    this.entities = options.entities;
  }

  public serialize(withAdapter?: boolean): IEntityAttribute {
    return {
      ...super.serialize(withAdapter),
      references: this.entities.map((ent) => ent.name)
    };
  }

  public inspectDataType(): string {
    return super.inspectDataType() + " [" +
      this.entities.reduce((p, e, idx) => p + (idx ? ", " : "") + e.name, "") + "]";
  }
}
