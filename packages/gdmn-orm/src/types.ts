import {SemCategory} from "gdmn-nlp";
import { LName } from "gdmn-internals";
import { IEntity } from "./serialize";

export type TValue = string | number | boolean | Date | Buffer | null;

export interface IEnumValue {
  value: string | number;
  lName?: LName;
}

export type ContextVariables = "CURRENT_TIMESTAMP" | "CURRENT_TIMESTAMP(0)" | "CURRENT_DATE" | "CURRENT_TIME";

export type AttributeDateTimeTypes = "Date"
  | "TimeStamp"
  | "Time";

export type BlobSubTypes = "Text" | "Binary"

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

export type GedeminEntityType = 'SIMPLE' | 'TREE' | 'LBRBTREE' | 'INHERITED';

export function getGedeminEntityType(entity: IEntity): GedeminEntityType {
  if (entity.parent) {
    return 'INHERITED';
  }

  if (entity.attributes.find( attr => attr.name === 'PARENT' )) {
    if (entity.attributes.find( attr => attr.name === 'LB' ) && entity.attributes.find( attr => attr.name === 'RB' )) {
      return 'LBRBTREE';
    } else {
      return 'TREE';
    }
  }

  return 'SIMPLE';
};
