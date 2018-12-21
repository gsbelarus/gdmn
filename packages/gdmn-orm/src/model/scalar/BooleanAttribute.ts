import {IAttributeAdapter} from "../../rdbadapter";
import {IBooleanAttribute} from "../../serialize";
import {AttributeTypes} from "../../types";
import {IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export interface IBooleanAttributeOptions extends IAttributeOptions<IAttributeAdapter> {
  defaultValue?: boolean;
}

export class BooleanAttribute extends ScalarAttribute {

  public type: AttributeTypes = "Boolean";

  public readonly defaultValue: boolean;

  constructor(options: IBooleanAttributeOptions) {
    super(options);
    this.defaultValue = options.defaultValue || false;
  }

  public serialize(withAdapter?: boolean): IBooleanAttribute {
    return {
      ...super.serialize(withAdapter),
      defaultValue: this.defaultValue
    };
  }
}
