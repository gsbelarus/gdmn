import {IAttributeAdapter} from "../../rdbadapter";
import {IStringAttribute} from "../../serialize";
import {AttributeTypes} from "../../types";
import {IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export interface IStringAttributeOptions extends IAttributeOptions<IAttributeAdapter> {
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  mask?: RegExp;
  autoTrim?: boolean;
}

export class StringAttribute extends ScalarAttribute {

  public type: AttributeTypes = "String";

  public readonly minLength?: number;
  public readonly maxLength?: number;
  public readonly defaultValue?: string;
  public readonly mask?: RegExp;
  public readonly autoTrim: boolean;

  constructor(options: IStringAttributeOptions) {
    super(options);
    this.minLength = options.minLength;
    this.maxLength = options.maxLength;
    this.defaultValue = options.defaultValue;
    this.autoTrim = options.autoTrim || true;
    this.mask = options.mask;
  }

  public serialize(withAdapter?: boolean): IStringAttribute {
    return {
      ...super.serialize(withAdapter),
      minLength: this.minLength,
      maxLength: this.maxLength,
      defaultValue: this.defaultValue,
      mask: this.mask,
      autoTrim: this.autoTrim
    };
  }

  public inspectDataType(): string {
    return super.inspectDataType() + (this.maxLength ? "(" + this.maxLength + ")" : "");
  }
}
