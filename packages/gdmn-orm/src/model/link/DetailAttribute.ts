import {IDetailAttributeAdapter} from "../../rdbadapter";
import {Attribute} from "../Attribute";
import {EntityAttribute, IEntityAttributeOptions} from "./EntityAttribute";

export class DetailAttribute extends EntityAttribute<IDetailAttributeAdapter> {

  constructor(options: IEntityAttributeOptions<IDetailAttributeAdapter>) {
    super(options);
  }

  public static isType(type: Attribute): type is DetailAttribute {
    return type instanceof DetailAttribute;
  }
}
