import {SemCategory} from "gdmn-nlp";

export interface ITName {
  name: string;
  fullName?: string;
}

export interface ILName {
  ru?: ITName;
  by?: ITName;
  en?: ITName;
}

export interface IEnumValue {
  value: string | number;
  lName?: ILName;
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
  lName: ILName;
  semCategories?: SemCategory[];
}
