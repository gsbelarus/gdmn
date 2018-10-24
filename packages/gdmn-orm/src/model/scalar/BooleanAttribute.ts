import {IAttributeAdapter} from "../../rdbadapter";
import {IBooleanAttribute} from "../../serialize";
import {Attribute, IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export interface IBooleanAttributeOptions extends IAttributeOptions<IAttributeAdapter> {
  defaultValue?: boolean;
}

export class BooleanAttribute extends ScalarAttribute {

  private readonly _defaultValue: boolean;

  constructor(options: IBooleanAttributeOptions) {
    super(options);
    this._defaultValue = options.defaultValue || false;
  }

  get defaultValue(): boolean {
    return this._defaultValue;
  }

  public static isType(type: Attribute): type is BooleanAttribute {
    return type instanceof BooleanAttribute;
  }

  public serialize(): IBooleanAttribute {
    return {
      ...super.serialize(),
      defaultValue: this._defaultValue
    };
  }
}
