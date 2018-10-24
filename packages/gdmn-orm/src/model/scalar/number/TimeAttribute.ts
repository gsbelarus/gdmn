import {IAttributeAdapter} from "../../../rdbadapter";
import {IDateAttribute} from "../../../serialize";
import {ContextVariables} from "../../../types";
import {Attribute} from "../../Attribute";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export class TimeAttribute extends NumberAttribute<Date, ContextVariables> {

  constructor(options: INumberAttributeOptions<Date, ContextVariables, IAttributeAdapter>) {
    super(options);
  }

  public static isType(type: Attribute): type is TimeAttribute {
    return type instanceof TimeAttribute;
  }

  public serialize(): IDateAttribute {
    return super.serialize();
  }
}
