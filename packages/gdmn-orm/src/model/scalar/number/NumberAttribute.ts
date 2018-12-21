import {IAttributeAdapter} from "../../../rdbadapter";
import {INumberAttribute} from "../../../serialize";
import {IBaseSemOptions} from "../../../types";
import {ScalarAttribute} from "../ScalarAttribute";

export interface INumberAttributeOptions<T, DF = undefined, Adapter = IAttributeAdapter>
  extends IBaseSemOptions<Adapter> {
  minValue?: T;
  maxValue?: T;
  defaultValue?: T | DF;
  required?: boolean;
}

export abstract class NumberAttribute<T, DF = undefined, Adapter = IAttributeAdapter> extends ScalarAttribute<Adapter> {

  public readonly minValue?: T;
  public readonly maxValue?: T;
  public readonly defaultValue?: T | DF;

  protected constructor(options: INumberAttributeOptions<T, DF, Adapter>) {
    super(options);
    this.minValue = options.minValue;
    this.maxValue = options.maxValue;
    this.defaultValue = options.defaultValue;
  }

  public serialize(withAdapter?: boolean): INumberAttribute<T, DF> {
    return {
      ...super.serialize(withAdapter),
      minValue: this.minValue,
      maxValue: this.maxValue,
      defaultValue: this.defaultValue
    };
  }
}
