import {IAttributeAdapter} from "../../../rdbadapter";
import {IDateAttribute} from "../../../serialize";
import {AttributeTypes, ContextVariables} from "../../../types";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export class DateAttribute extends NumberAttribute<Date, ContextVariables> {

  public type: AttributeTypes = "Date";

  constructor(options: INumberAttributeOptions<Date, ContextVariables, IAttributeAdapter>) {
    super(options);
  }

  public serialize(withAdapter?: boolean): IDateAttribute {
    return super.serialize(withAdapter);
  }
}
