import {IAttributeAdapter} from "../../../rdbadapter";
import {INumericAttribute} from "../../../serialize";
import {AttributeTypes} from "../../../types";
import {INumberAttributeOptions, NumberAttribute} from "./NumberAttribute";
import { Attribute } from "../../Attribute";

export interface INumericAttributeOptions<Adapter> extends INumberAttributeOptions<number, undefined, Adapter> {
  precision: number;
  scale: number;
}

export function isNumericAttribute(attr: any): attr is NumericAttribute {
  return attr.type === 'Numeric' && typeof attr.precision === 'number' && typeof attr.scale === 'number';
}

export class NumericAttribute extends NumberAttribute<number> {

  public type: AttributeTypes = "Numeric";

  public readonly precision: number;
  public readonly scale: number;

  constructor(options: INumericAttributeOptions<IAttributeAdapter>) {
    super(options);
    this.precision = options.precision;
    this.scale = options.scale;
  }

  public inspectDataType(): string {
    return `${super.inspectDataType()}(${this.precision}, ${Math.abs(this.scale)})`;
  }

  public serialize(withAdapter?: boolean): INumericAttribute {
    return {
      ...super.serialize(withAdapter),
      precision: this.precision,
      scale: this.scale
    };
  }
}
