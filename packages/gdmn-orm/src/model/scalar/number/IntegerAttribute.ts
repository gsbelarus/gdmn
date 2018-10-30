import {IAttributeAdapter} from "../../../rdbadapter";
import {AttributeTypes} from "../../../types";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export class IntegerAttribute extends NumberAttribute<number> {

  public type: AttributeTypes = "Integer";

  constructor(options: INumberAttributeOptions<number, undefined, IAttributeAdapter>) {
    super(options);
  }
}
