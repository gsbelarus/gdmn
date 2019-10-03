import {SemCategory} from "gdmn-nlp";
import { LName } from "gdmn-internals";

export type TValue = string | number | boolean | Date | Buffer | null;

export interface IEnumValue {
  value: string | number;
  lName?: LName;
}

export type ContextVariables = "CURRENT_TIMESTAMP" | "CURRENT_TIMESTAMP(0)" | "CURRENT_DATE" | "CURRENT_TIME";

export type AttributeDateTimeTypes = "Date"
  | "TimeStamp"
  | "Time";

export type AttributeTypes = AttributeDateTimeTypes
  | "Entity"
  | "String"
  | "Set"
  | "Parent"
  | "Detail"
  | "Sequence"
  | "Integer"
  | "Numeric"
  | "Float"
  | "Boolean"
  | "Blob"
  | "Enum";

export const attributeTypeNames = ["Entity"
  , "String"
  , "Set"
  , "Parent"
  , "Detail"
  , "Sequence"
  , "Integer"
  , "Numeric"
  , "Float"
  , "Boolean"
  , "Date"
  , "TimeStamp"
  , "Time"
  , "Blob"
  , "Enum"];

export interface IBaseOptions<Adapter = any> {
  name: string;
  adapter?: Adapter;

  [name: string]: any;
}

export interface IBaseSemOptions<Adapter = any> extends IBaseOptions<Adapter> {
  lName: LName;
  semCategories?: SemCategory[];
}

export const entityTypeNames = ["Simple table"
    , "Simple tree"
    , "Internal tree"
    , "Inherited"];
