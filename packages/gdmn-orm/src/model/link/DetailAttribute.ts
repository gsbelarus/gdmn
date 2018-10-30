import {IDetailAttributeAdapter} from "../../rdbadapter";
import {AttributeTypes} from "../../types";
import {EntityAttribute, IEntityAttributeOptions} from "./EntityAttribute";

export class DetailAttribute extends EntityAttribute<IDetailAttributeAdapter> {

  public type: AttributeTypes = "Detail";

  constructor(options: IEntityAttributeOptions<IDetailAttributeAdapter>) {
    super(options);
  }
}
