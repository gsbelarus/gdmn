import {IAttributeAdapter} from "../../rdbadapter";
import {IEntityAttribute} from "../../serialize";
import {Attribute, IAttributeOptions} from "../Attribute";
import {Entity} from "../Entity";

export interface IEntityAttributeOptions<Adapter = IAttributeAdapter> extends IAttributeOptions<Adapter> {
  entities: Entity[];
}

export class EntityAttribute<Adapter = IAttributeAdapter> extends Attribute<Adapter> {

  private readonly _entities: Entity[];

  constructor(options: IEntityAttributeOptions<Adapter>) {
    super(options);
    this._entities = options.entities;
  }

  get entities(): Entity[] {
    return this._entities;
  }

  public static isType(type: Attribute): type is EntityAttribute<any> {
    return type instanceof EntityAttribute;
  }

  public serialize(): IEntityAttribute {
    return {
      ...super.serialize(),
      references: this._entities.map((ent) => ent.name)
    };
  }

  public inspectDataType(): string {
    return super.inspectDataType() + " [" +
      this._entities.reduce((p, e, idx) => p + (idx ? ", " : "") + e.name, "") + "]";
  }
}
