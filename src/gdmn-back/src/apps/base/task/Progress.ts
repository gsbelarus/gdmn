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

  private _max: number = Progress.DEFAULT_MAX;
  private _min: number = Progress.DEFAULT_MIN;

  private _value: number = 0;
  private _description: string = "";

  constructor(options?: IProgressOptions) {
    this.reset(options, false);
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

  public increment(step: number, description: string, notify: boolean = true): void {
    const i = step !== undefined ? Math.abs(step) : 1;
    if (this._value + i > this._max) {
      throw new Error("Out of range");
    }
    this._value += i;
    this._description = description;

    if (notify) {
      this.emitter.emit("change", this);
    }
  }

  public reset(options: IProgressOptions = {}, notify: boolean = true): void {
    this._max = options.max !== undefined ? options.max : this.max;
    this._min = options.min !== undefined ? options.min : this.min;
    if (this._min > this._max) {
      throw new Error(`Incorrect range: ${this._min} > ${this._max}`);
    }
    this._value = this._min;
    this._description = "";

    if (notify) {
      this.emitter.emit("change", this);
    }
  }
}
