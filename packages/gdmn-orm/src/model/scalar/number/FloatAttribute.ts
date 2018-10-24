import {IAttributeAdapter} from "../../../rdbadapter";
import {Attribute} from "../../Attribute";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export class FloatAttribute extends NumberAttribute<number> {

  constructor(options: INumberAttributeOptions<number, undefined, IAttributeAdapter>) {
    super(options);
  }

  public static isType(type: Attribute): type is FloatAttribute {
    return type instanceof FloatAttribute;
  }
}
