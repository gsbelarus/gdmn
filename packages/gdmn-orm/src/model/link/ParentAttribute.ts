import {IParentAttributeAdapter} from "../../rdbadapter";
import {AttributeTypes, IBaseSemOptions} from "../../types";
import {Entity} from "../Entity";
import {EntityAttribute} from "./EntityAttribute";

export interface IParentAttributeOptions extends IBaseSemOptions<IParentAttributeAdapter> {
  entities: Entity[];
}

export class ParentAttribute extends EntityAttribute<IParentAttributeAdapter> {

  public type: AttributeTypes = "Parent";

  constructor(options: IParentAttributeOptions) {
    super(options);
  }
}
