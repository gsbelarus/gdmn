import {IAttributeAdapter} from "../../../rdbadapter";
import {INumberAttribute} from "../../../serialize";
import {IBaseSemOptions} from "../../../types";
import {Attribute} from "../../Attribute";
import {ScalarAttribute} from "../ScalarAttribute";

export interface INumberAttributeOptions<T, DF = undefined, Adapter = IAttributeAdapter>
  extends IBaseSemOptions<Adapter> {
  minValue?: T;
  maxValue?: T;
  defaultValue?: T | DF;
  required?: boolean;
}

export abstract class NumberAttribute<T, DF = undefined, Adapter = IAttributeAdapter> extends ScalarAttribute<Adapter> {

  private readonly _minValue?: T;
  private readonly _maxValue?: T;
  private readonly _defaultValue?: T | DF;

  protected constructor(options: INumberAttributeOptions<T, DF, Adapter>) {
    super(options);
    this._minValue = options.minValue;
    this._maxValue = options.maxValue;
    this._defaultValue = options.defaultValue;
  }

  get minValue(): T | undefined {
    return this._minValue;
  }

  get maxValue(): T | undefined {
    return this._maxValue;
  }

  get defaultValue(): T | DF | undefined {
    return this._defaultValue;
  }

  public static isType(type: Attribute): type is NumberAttribute<any> {
    return type instanceof NumberAttribute;
  }

  public serialize(): INumberAttribute<T, DF> {
    return {
      ...super.serialize(),
      minValue: this._minValue,
      maxValue: this._maxValue,
      defaultValue: this._defaultValue
    };
  }
}
