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

  public readonly values: IEnumValue[];
  public readonly defaultValue?: string | number;

  constructor(options: IEnumAttributeOptions) {
    super(options);
    this.values = options.values;
    this.defaultValue = options.defaultValue;
  }

  public inspectDataType(): string {
    return super.inspectDataType() + " " + JSON.stringify(this.values);
  }

  public serialize(withAdapter?: boolean): IEnumAttribute {
    return {
      ...super.serialize(withAdapter),
      values: this.values,
      defaultValue: this.defaultValue
    };
  }
}
