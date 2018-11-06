export type TSortOrder = 'ASC' | 'DESC' | 'UNDEFINED';

export enum TFieldType {
  String = 0,
  Integer,
  Boolean,
  Currency,
  Float,
  Date
};

export interface INamedField {
  fieldName: string;
};

export interface IFieldDef extends INamedField {
  dataType: TFieldType;
  size?: number;
  precision?: number;
  required?: boolean;
  readOnly?: boolean;
  calculated?: boolean;
  mask?: RegExp;
  caption?: string;
  shortCaption?: string;
  description?: string;
};

export type FieldDefs = IFieldDef[];

export interface ISortField extends INamedField {
  asc?: boolean;
};

export type SortFields = ISortField[];

export type TDataType = string | number | boolean | Date | null;

export interface IDataRow {
  [fieldName: string]: TDataType;
};

export interface IMatchedSubString {
  str: string;
  matchFilter?: boolean;
  foundIdx?: number;
};

export interface IFoundNode {
  rowIdx: number;
  fieldName: string;
  matchStart: number;
  matchLen: number;
  foundIdx: number;
};

export type FoundNodes = IFoundNode[];

export type FoundRows = FoundNodes[];

