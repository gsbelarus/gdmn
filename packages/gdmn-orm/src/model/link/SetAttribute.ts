import {ISetAttributeAdapter} from "../../rdbadapter";
import {ISetAttribute} from "../../serialize";
import {AttributeTypes} from "../../types";
import {Attribute} from "../Attribute";
import {IAttributes} from "../Entity";
import {EntityAttribute, IEntityAttributeOptions} from "./EntityAttribute";

export interface ISetAttributeOptions extends IEntityAttributeOptions<ISetAttributeAdapter> {
  presLen?: number;
  isChar?: boolean;
}

export class SetAttribute extends EntityAttribute<ISetAttributeAdapter> {

  public type: AttributeTypes = "Set";

  public readonly attributes: IAttributes = {};
  public readonly presLen: number;
  public readonly isChar: boolean;

  constructor(options: ISetAttributeOptions) {
    super(options);
    this.presLen = (options.isChar || false) ? options.presLen || 1 : 1;
    this.isChar = options.isChar || false;
  }

  public attribute(name: string): Attribute | never {
    const found = this.attributes[name];
    if (!found) {
      throw new Error(`Unknown attribute ${name}`);
    }
    return found;
  }

  public add<T extends Attribute>(attribute: T): T | never {
    if (this.attributes[attribute.name]) {
      throw new Error(`Attribute ${attribute.name} already exists`);
    }

    return this.attributes[attribute.name] = attribute;
  }

  public serialize(withAdapter?: boolean): ISetAttribute {
    return {
      ...super.serialize(withAdapter),
      attributes: Object.entries(this.attributes).map((a) => a[1].serialize(withAdapter)),
      presLen: this.presLen,
      isChar: this.isChar
    };
  }

  public inspect(indent: string = "    "): string[] {
    const result = super.inspect();
    return [...result,
      ...Object.entries(this.attributes).reduce((p, a) => {
        return [...p, ...a[1].inspect(indent + "  ")];
      }, [] as string[])
    ];
  }
}
