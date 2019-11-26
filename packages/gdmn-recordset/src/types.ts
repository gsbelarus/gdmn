import { List } from "immutable";
import { IEntityQueryResponseFieldAlias, Attribute } from "gdmn-orm";
import { ISqlQueryResponseAliasesRdb, ISqlQueryResponseAliasesOrm, INumberFormat, IDateFormat } from 'gdmn-internals';

export enum TStatus {
  PARTIAL,
  LOADING,
  FULL
};

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

export enum TRowState {
  Normal = 0,
  Deleted,
  Edited,
  Inserted
};

export type TDataType = string | number | boolean | Date | null;

export type TAlignment = 'LEFT' | 'CENTER' | 'RIGHT';

export interface IFieldDef extends INamedField {
  dataType: TFieldType;
  size?: number;
  precision?: number;
  required?: boolean;
  readOnly?: boolean;
  defaultValue?: TDataType;
  calculated?: boolean;
  calcFunc?: TFieldCalcFunc;
  mask?: RegExp;
  caption?: string;
  shortCaption?: string;
  description?: string;
  aggregator?: IFieldAggregator<any>;
  olapValue?: TDataType[];
  alignment?: TAlignment;
  numberFormat?: INumberFormat;
  dateFormat?: IDateFormat;
  eqfa?: IEntityQueryResponseFieldAlias;
  sqlfa?: {
    rdb: ISqlQueryResponseAliasesRdb;
    orm?: ISqlQueryResponseAliasesOrm;
  };
};

export type FieldDefs = IFieldDef[];

export interface ISortField extends INamedField {
  asc?: boolean;
  groupBy?: boolean;
  calcAggregates?: boolean;
};

export type SortFields = ISortField[];

export interface IDataRow {
  [fieldName: string]: TDataType | TRowState | IDataRow;
};

export type Data = List<IDataRow>;

export type GetRowDataFunc = (idx: number) => IDataRow;

export type FilterFunc = (row: IDataRow, idx: number) => boolean;

export type TRowCalcFunc = (row: IDataRow) => IDataRow;

export enum TRowType {
  Data = 0,
  HeaderCollapsed,
  HeaderExpanded,
  Footer
};

export interface IRow {
  data: IDataRow,
  type: TRowType,
  group?: IDataGroup
};

export interface IDataGroup {
  header: IDataRow;
  level: number;
  collapsed: boolean;
  subGroups: IDataGroup[];
  footer?: IDataRow;
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

export type CloneGroup = (
  parent: IDataGroup | undefined,
  prev: IDataGroup | undefined,
  g: IDataGroup) => IDataGroup;

export type MeasureCalcFunc = (getRowDataFunc: GetRowDataFunc, rowStart: number, count: number) => TDataType;

export interface IMeasure {
  fieldName: string;
  measureCalcFunc: MeasureCalcFunc;
  caption?: string;
  shortCaption?: string;
  description?: string;
};

export type Measures = IMeasure[];

/**
 * Мы имеем две ситуации, когда рекорд сет наполнен данными
 * из произвольного источника (например, список сущностей,
 * взятых их erModel) и когда рекорд сет содержит результат
 * выполнения EntityQuery. Соответственно и связка мастер-дитэйл
 * сделана так, чтобы поддерживат оба случая.
 */
export interface IMasterLink {
  /**
   * Имя мастер рекордсета.
   */
  masterName: string;
  /**
   * Имя поля в мастер рекордсете. Может отсутствовать,
   * если связка устанавливается между результатами двух
   * EntityQuery и мы берем значение первичного ключа
   * из мастер query.
   */
  masterField?: string;
  /**
   * Вместо detailField может указываться detailAttribute.
   */
  detailField?: string;
  detailAttribute?: Attribute;
  /**
   * Значение, для которого установлена связь. Сравнивая его
   * со значением masterField или первичного ключа текущей записи
   * из masterName мы можем понять надо ли нам перестраивать
   * детальный набор данных.
   */
  value: TDataType | undefined;
};

/**
 * Результат выполнения функции передачи изменений
 * записи на сервер.
 */

export enum TCommitResult {
  /**
   * Изменения подтверждены. Убираем статус записи и удаляем
   * прежнюю версию.
   */
  Success = 0,
  /**
   * Отмена изменений. Убираем статус и возвращаем прежнюю версию.
   */
  Cancel,
  /**
   * Изменения не получается применить на сервере.
   * Оставляем статус записи неизменным. Переходим к следующей.
   */
  Skip,
  /**
   * Изменения не получается применить на сервере.
   * Прерываем процесс.
   */
  Abort,
  /**
   * Изменения не получается применить на сервере.
   * Прерываем процесс и возвращаем все оставшиеся
   * записи в исходное состояние.
   */
  AbortCancelAll
};

export type TCommitFunc = (row: IDataRow) => Promise<TCommitResult>;
