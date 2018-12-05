import { List } from "immutable";
import { INumberFormat } from "./format";

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

export interface IFieldAggregator<Acc, Res = TDataType> {
  init: () => Acc;
  processRow: (row: IDataRow, fieldName: string, acc: Acc) => Acc;
  getTotal: (acc: Acc) => Res | null;
};

export type TDataType = string | number | boolean | Date | null;

export type TAlignment = 'LEFT' | 'CENTER' | 'RIGHT';

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
  aggregator?: IFieldAggregator<any>;
  olapValue?: TDataType[];
  alignment?: TAlignment;
  format?: INumberFormat;
};

export type FieldDefs = IFieldDef[];

export interface ISortField extends INamedField {
  asc?: boolean;
  groupBy?: boolean;
  calcAggregates?: boolean;
};

export type SortFields = ISortField[];


export interface IDataRow {
  [fieldName: string]: TDataType;
};

export type Data<R extends IDataRow = IDataRow> = List<R>;

export type GetRowDataFunc<R extends IDataRow = IDataRow> = (idx: number) => R;

export type FilterFunc<R extends IDataRow = IDataRow> = (row: R, idx: number) => boolean;

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

export type CloneGroup<R extends IDataRow = IDataRow> = (
  parent: IDataGroup<R> | undefined,
  prev: IDataGroup<R> | undefined,
  g: IDataGroup<R>) => IDataGroup<R>;

export type MeasureCalcFunc<R extends IDataRow> = (getRowDataFunc: GetRowDataFunc<R>, rowStart: number, count: number) => TDataType;

export interface IMeasure<R extends IDataRow> {
  fieldName: string;
  measureCalcFunc: MeasureCalcFunc<R>;
  caption?: string;
  shortCaption?: string;
  description?: string;
};

export type Measures<R extends IDataRow> = IMeasure<R>[];

