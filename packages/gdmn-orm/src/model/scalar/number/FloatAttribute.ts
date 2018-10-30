import {IAttributeAdapter} from "../../../rdbadapter";
import {AttributeTypes} from "../../../types";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export class FloatAttribute extends NumberAttribute<number> {

  public type: AttributeTypes = "Float";

  constructor(options: INumberAttributeOptions<number, undefined, IAttributeAdapter>) {
    super(options);
  }
}
