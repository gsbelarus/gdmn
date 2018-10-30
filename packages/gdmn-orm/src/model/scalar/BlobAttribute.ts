import {IAttributeAdapter} from "../../rdbadapter";
import {AttributeTypes} from "../../types";
import {IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export class BlobAttribute extends ScalarAttribute {

  public type: AttributeTypes = "Blob";

  constructor(options: IAttributeOptions<IAttributeAdapter>) {
    super(options);
  }
}
