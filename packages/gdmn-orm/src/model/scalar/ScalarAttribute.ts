import {IAttributeAdapter} from "../../rdbadapter";
import {Attribute, IAttributeOptions} from "../Attribute";

export abstract class ScalarAttribute<Adapter = IAttributeAdapter> extends Attribute<Adapter> {

  protected constructor(options: IAttributeOptions<Adapter>) {
    super(options);
  }
}
