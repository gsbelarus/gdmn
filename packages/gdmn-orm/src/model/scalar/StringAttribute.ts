import {IAttributeAdapter} from "../../rdbadapter";
import {IStringAttribute} from "../../serialize";
import {AttributeTypes} from "../../types";
import {IAttributeOptions} from "../Attribute";
import {ScalarAttribute} from "./ScalarAttribute";

export interface IStringAttributeOptions extends IAttributeOptions<IAttributeAdapter> {
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  mask?: RegExp;
  autoTrim?: boolean;
}

export class StringAttribute extends ScalarAttribute {

  public type: AttributeTypes = "String";

  private readonly _minLength?: number;
  private readonly _maxLength?: number;
  private readonly _defaultValue?: string;
  private readonly _mask?: RegExp;
  private readonly _autoTrim: boolean;

  constructor(options: IStringAttributeOptions) {
    super(options);
    this._minLength = options.minLength;
    this._maxLength = options.maxLength;
    this._defaultValue = options.defaultValue;
    this._autoTrim = options.autoTrim || true;
    this._mask = options.mask;
  }

  get minLength(): number | undefined {
    return this._minLength;
  }

  get maxLength(): number | undefined {
    return this._maxLength;
  }

  get defaultValue(): string | undefined {
    return this._defaultValue;
  }

  get mask(): RegExp | undefined {
    return this._mask;
  }

  get autoTrim(): boolean {
    return this._autoTrim;
  }

  public serialize(): IStringAttribute {
    return {
      ...super.serialize(),
      minLength: this._minLength,
      maxLength: this._maxLength,
      defaultValue: this._defaultValue,
      mask: this._mask,
      autoTrim: this._autoTrim
    };
  }

  public inspectDataType(): string {
    return super.inspectDataType() + (this._maxLength ? "(" + this._maxLength + ")" : "");
  }
}
