import {IAttributeAdapter} from "../../../rdbadapter";
import {IDateAttribute} from "../../../serialize";
import {AttributeTypes, ContextVariables} from "../../../types";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export class TimeAttribute extends NumberAttribute<Date, ContextVariables> {

  public type: AttributeTypes = "Time";

  constructor(options: INumberAttributeOptions<Date, ContextVariables, IAttributeAdapter>) {
    super(options);
  }

  public serialize(withAdapter?: boolean): IDateAttribute {
    return super.serialize(withAdapter);
  }
}
