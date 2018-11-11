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

export type TFieldCalcFunc = (row: IDataRow) => TDataType;

export interface IFieldDef extends INamedField {
  dataType: TFieldType;
  size?: number;
  precision?: number;
  required?: boolean;
  readOnly?: boolean;
  calculated?: boolean;
  calcFunc?: TFieldCalcFunc;
  mask?: RegExp;
  caption?: string;
  shortCaption?: string;
  description?: string;
};

export type FieldDefs = IFieldDef[];

export interface ISortField extends INamedField {
  asc?: boolean;
  groupBy?: boolean;
};

export type SortFields = ISortField[];


export type TDataType = string | number | boolean | Date | null;

export interface IDataRow {
  [fieldName: string]: TDataType;
};

export type TRowCalcFunc<R extends IDataRow> = (row: R) => R;

export enum TRowType {
  Data = 0,
  HeaderCollapsed,
  HeaderExpanded,
  Footer
};

export interface IRow<R extends IDataRow = IDataRow> {
  data: R,
  type: TRowType,
  group?: IDataGroup<R>
};

export interface IDataGroup<R extends IDataRow = IDataRow> {
  header: R;
  level: number;
  collapsed: boolean;
  subGroups: IDataGroup<R>[];
  footer?: R;
  rowIdx: number;
  bufferIdx: number;
  bufferCount: number;
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

