import {IAttributeAdapter} from "../../rdbadapter";
import {Attribute, IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export class TimeIntervalAttribute extends ScalarAttribute {

  constructor(options: IAttributeOptions<IAttributeAdapter>) {
    super(options);
  }

  public static isType(type: Attribute): type is TimeIntervalAttribute {
    return type instanceof TimeIntervalAttribute;
  }
}
