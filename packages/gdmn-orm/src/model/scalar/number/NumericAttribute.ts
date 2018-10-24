import {IAttributeAdapter} from "../../../rdbadapter";
import {INumericAttribute} from "../../../serialize";
import {Attribute} from "../../Attribute";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";

export interface INumericAttributeOptions<Adapter> extends INumberAttributeOptions<number, undefined, Adapter> {
  precision: number;
  scale: number;
}

export class NumericAttribute extends NumberAttribute<number> {

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

  public static isType(type: Attribute): type is NumericAttribute {
    return type instanceof NumericAttribute;
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
