import {IAttributeAdapter} from "../../../rdbadapter";
import {IDateAttribute} from "../../../serialize";
import {ContextVariables} from "../../../types";
import {Attribute} from "../../Attribute";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export class DateAttribute extends NumberAttribute<Date, ContextVariables> {

  constructor(options: INumberAttributeOptions<Date, ContextVariables, IAttributeAdapter>) {
    super(options);
  }

  public static isType(type: Attribute): type is DateAttribute {
    return type instanceof DateAttribute;
  }

  public serialize(): IDateAttribute {
    return super.serialize();
  }
}
