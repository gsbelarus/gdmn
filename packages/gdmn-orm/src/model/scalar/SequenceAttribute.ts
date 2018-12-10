import {IAttributeAdapter} from "../../rdbadapter";
import {ISequenceAttribute} from "../../serialize";
import {AttributeTypes, IBaseSemOptions} from "../../types";
import {Sequence} from "../Sequence";
import {ScalarAttribute} from "./ScalarAttribute";

export interface ISequenceAttributeOptions<Adapter> extends IBaseSemOptions<Adapter> {
  sequence: Sequence;
}

export class SequenceAttribute extends ScalarAttribute<IAttributeAdapter> {

  public type: AttributeTypes = "Sequence";

  public readonly sequence: Sequence;

  constructor(options: ISequenceAttributeOptions<IAttributeAdapter>) {
    super({...options, required: true});
    this.sequence = options.sequence;
  }

  public serialize(withAdapter?: boolean): ISequenceAttribute {
    return {
      ...super.serialize(withAdapter),
      sequence: this.sequence.name
    };
  }
}
