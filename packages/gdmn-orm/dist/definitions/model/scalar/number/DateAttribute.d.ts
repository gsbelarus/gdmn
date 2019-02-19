import {IAttributeAdapter} from "../../../rdbadapter";
import {IDateAttribute} from "../../../serialize";
import {AttributeTypes, ContextVariables} from "../../../types";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export declare class DateAttribute extends NumberAttribute<Date, ContextVariables> {
  type: AttributeTypes;

  constructor(options: INumberAttributeOptions<Date, ContextVariables, IAttributeAdapter>);

  serialize(withAdapter?: boolean): IDateAttribute;
}

//# sourceMappingURL=DateAttribute.d.ts.map
