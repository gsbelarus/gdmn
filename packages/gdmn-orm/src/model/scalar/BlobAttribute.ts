import {IAttributeAdapter} from "../../rdbadapter";
import {IBlobAttribute} from "../../serialize";
import {AttributeTypes, BlobSubTypes} from "../../types";
import {IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export interface IBlobAttributeOptions extends IAttributeOptions<IAttributeAdapter> {
  subType?: BlobSubTypes;
}

export class BlobAttribute extends ScalarAttribute {

  public type: AttributeTypes = "Blob";
  public readonly subType: BlobSubTypes;

  constructor(options: IBlobAttributeOptions) {
    super(options);
    this.subType = options.subType || 'Binary';
  }

  public serialize(withAdapter?: boolean): IBlobAttribute {
    return {
      ...super.serialize(withAdapter),
      subType: this.subType
    }
  }
}
