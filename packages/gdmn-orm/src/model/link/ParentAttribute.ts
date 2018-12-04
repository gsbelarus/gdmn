import {AttributeTypes} from "../../types";
import {EntityAttribute, IEntityAttributeOptions} from "./EntityAttribute";

export class ParentAttribute extends EntityAttribute {

  public type: AttributeTypes = "Parent";

  constructor(options: IEntityAttributeOptions) {
    super(options);
  }
}
