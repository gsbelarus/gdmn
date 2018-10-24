import {EventEmitter} from "events";
import StrictEventEmitter from "strict-event-emitter-types";

export interface IProgressOptions {
  readonly min?: number;
  readonly max?: number;
}

export interface IProgressEvents {
  change: (progress: Progress) => void;
}

export class Progress {

  public static readonly DEFAULT_MAX = 100;
  public static readonly DEFAULT_MIN = 0;

  public readonly emitter: StrictEventEmitter<EventEmitter, IProgressEvents> = new EventEmitter();

  private readonly _max: number;
  private readonly _min: number;

  private _value: number;
  private _description: string;

  constructor(options: IProgressOptions = {}) {
    this._max = options.max !== undefined ? options.max : Progress.DEFAULT_MAX;
    this._min = options.min !== undefined ? options.min : Progress.DEFAULT_MIN;
    if (this._min >= this._max) {
      throw new Error(`Incorrect range: ${this._min} >= ${this._max}`);
    }
    this._value = this._min;
    this._description = "";
  }

  get value(): number {
    return this._value;
  }

  get max(): number {
    return this._max;
  }

  get min(): number {
    return this._min;
  }

  get description(): string {
    return this._description;
  }

  get done(): boolean {
    return this._value === this._max;
  }

  public increment(step: number, description: string): void {
    const i = step !== undefined ? Math.abs(step) : 1;
    if (this._value + i > this._max) {
      throw new Error("Out of range");
    }
    this._value += i;
    this._description = description;
    this.emitter.emit("change", this);
  }

  public reset(): void {
    this._value = this._min;
    this._description = "";
    this.emitter.emit("change", this);
  }
}
