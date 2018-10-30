import {IAttributeAdapter} from "../../../rdbadapter";
import {INumericAttribute} from "../../../serialize";
import {AttributeTypes} from "../../../types";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export interface INumericAttributeOptions<Adapter> extends INumberAttributeOptions<number, undefined, Adapter> {
  precision: number;
  scale: number;
}

export class NumericAttribute extends NumberAttribute<number> {

  public type: AttributeTypes = "Numeric";

  private readonly _precision: number;
  private readonly _scale: number;

  constructor(options: INumericAttributeOptions<IAttributeAdapter>) {
    super(options);
    this._precision = options.precision;
    this._scale = options.scale;
  }

  get precision(): number {
    return this._precision;
  }

  get scale(): number {
    return this._scale;
  }

  public inspectDataType(): string {
    return `${super.inspectDataType()}(${this._precision}, ${Math.abs(this._scale)})`;
  }

  public serialize(): INumericAttribute {
    return {
      ...super.serialize(),
      precision: this._precision,
      scale: this._scale
    };
  }
}
