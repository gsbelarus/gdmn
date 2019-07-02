import {SemCategory} from "gdmn-nlp";
import { LName } from "gdmn-internals";
import {Attribute} from "./model/Attribute";

export type TValue = string | number | boolean | Date | Buffer | null;

export interface IEnumValue {
  value: string | number;
  lName?: LName;
}

export type ContextVariables = "CURRENT_TIMESTAMP" | "CURRENT_TIMESTAMP(0)" | "CURRENT_DATE" | "CURRENT_TIME";

export type AttributeTypes = "Entity"
  | "String"
  | "Set"
  | "Parent"
  | "Detail"
  | "Sequence"
  | "Integer"
  | "Numeric"
  | "Float"
  | "Boolean"
  | "Date"
  | "TimeStamp"
  | "Time"
  | "Blob"
  | "Enum";

export interface IBaseOptions<Adapter = any> {
  name: string;
  adapter?: Adapter;

  [name: string]: any;
}

export interface IBaseSemOptions<Adapter = any> extends IBaseOptions<Adapter> {
  lName: LName;
  semCategories?: SemCategory[];
}

export interface IListAttribute {
  attribute: Attribute;
}
