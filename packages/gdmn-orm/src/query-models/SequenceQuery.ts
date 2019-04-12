import { ERModel } from "../model/ERModel";
import { Sequence } from "../model/Sequence";

export interface ISequenceQueryResponse {
  value: number; 
}

export interface ISequenceQueryInspector {
  name: string;
  increment?: number;
}

export class SequenceQuery {

  public readonly sequence: Sequence;
  public readonly increment?: number;

  constructor(query: Sequence, increment?: number) {
    this.sequence = query;
    this.increment = increment;
  }

  public inspect(): ISequenceQueryInspector {
    return {
      name: this.sequence.name,
      increment: this.increment
    };
  }

  public static inspectorToObject(erModel: ERModel, inspector: ISequenceQueryInspector): SequenceQuery {
    const sequence = erModel.sequence(inspector.name);
    const increment = inspector.increment;
    return new SequenceQuery(sequence, increment);
  }
} 
