import {IAttributeAdapter} from "../../rdbadapter";
import {Attribute, IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export class BlobAttribute extends ScalarAttribute {

  constructor(options: IAttributeOptions<IAttributeAdapter>) {
    super(options);
  }

  public static isType(type: Attribute): type is BlobAttribute {
    return type instanceof BlobAttribute;
  }
}
