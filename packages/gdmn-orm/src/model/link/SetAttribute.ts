import {ISetAttributeAdapter} from "../../rdbadapter";
import {ISetAttribute} from "../../serialize";
import {AttributeTypes} from "../../types";
import {Attribute} from "../Attribute";
import {IAttributes} from "../Entity";
import {EntityAttribute, IEntityAttributeOptions} from "./EntityAttribute";

export interface ISetAttributeOptions extends IEntityAttributeOptions<ISetAttributeAdapter> {
  presLen?: number;
}

export class SetAttribute extends EntityAttribute<ISetAttributeAdapter> {

  public type: AttributeTypes = "Set";

  private readonly _attributes: IAttributes = {};
  private readonly _presLen: number;

  constructor(options: ISetAttributeOptions) {
    super(options);
    this._presLen = options.presLen || 1;
  }

  get attributes(): IAttributes {
    return this._attributes;
  }

  get presLen(): number {
    return this._presLen;
  }

  public attribute(name: string): Attribute | never {
    const found = this._attributes[name];
    if (!found) {
      throw new Error(`Unknown attribute ${name}`);
    }
    return found;
  }

  public add<T extends Attribute>(attribute: T): T | never {
    if (this._attributes[attribute.name]) {
      throw new Error(`Attribute ${attribute.name} already exists`);
    }

    return this._attributes[attribute.name] = attribute;
  }

  public serialize(): ISetAttribute {
    return {
      ...super.serialize(),
      attributes: Object.entries(this._attributes).map((a) => a[1].serialize()),
      presLen: this._presLen
    };
  }

  public inspect(indent: string = "    "): string[] {
    const result = super.inspect();
    return [...result,
      ...Object.entries(this._attributes).reduce((p, a) => {
        return [...p, ...a[1].inspect(indent + "  ")];
      }, [] as string[])
    ];
  }
}
