import {IAttributeAdapter} from "../../rdbadapter";
import {IEnumAttribute} from "../../serialize";
import {AttributeTypes, IEnumValue} from "../../types";
import {IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export interface IEnumAttributeOptions extends IAttributeOptions<IAttributeAdapter> {
  values: IEnumValue[];
  defaultValue?: string | number;
}

export class EnumAttribute extends ScalarAttribute {

  public type: AttributeTypes = "Enum";

  private readonly _values: IEnumValue[];
  private readonly _defaultValue?: string | number;

  constructor(options: IEnumAttributeOptions) {
    super(options);
    this._values = options.values;
    this._defaultValue = options.defaultValue;
  }

  get values(): IEnumValue[] {
    return this._values;
  }

  get defaultValue(): string | number | undefined {
    return this._defaultValue;
  }

  public inspectDataType(): string {
    return super.inspectDataType() + " " + JSON.stringify(this._values);
  }

  public serialize(): IEnumAttribute {
    return {
      ...super.serialize(),
      values: this._values,
      defaultValue: this._defaultValue
    };
  }
}
