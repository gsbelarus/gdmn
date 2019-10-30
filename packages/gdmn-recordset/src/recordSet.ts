import equal from "fast-deep-equal";
import {EntityQuery} from "gdmn-orm";
import {List} from "immutable";
import {IFilter} from "./filter";
import {
  CloneGroup,
  Data,
  FieldDefs,
  FoundNodes,
  FoundRows,
  IDataGroup,
  IDataRow,
  IFieldDef,
  IMasterLink,
  IMatchedSubString,
  INamedField,
  IRow,
  Measures,
  SortFields,
  TDataType,
  TFieldType,
  TRowCalcFunc,
  TRowType,
  TStatus,
  TRowState,
  TCommitResult,
  TCommitFunc} from "./types";
import {checkField, getAsBoolean, getAsDate, getAsNumber, getAsString, isNull} from "./utils";
import { INumberFormat, IDateFormat } from "gdmn-internals";

export interface IRSSQLParams {
  [name: string]: any;
};

export interface IRSSQLSelect {
  select: string;
  params?: IRSSQLParams;
};

export interface IRecordSetOptions {
  name: string;
  fieldDefs: FieldDefs;
  data: Data;
  sequentially?: boolean;
  masterLink?: IMasterLink;
  eq?: EntityQuery;
  queryPhrase?: string;
  sql?: IRSSQLSelect;
};

export interface IRecordSetDataOptions {
  data: Data;
  masterLink?: IMasterLink;
};

export interface IRecordSetParams {
  name: string;
  eq?: EntityQuery;
  queryPhrase?: string;
  sql?: IRSSQLSelect;
  fieldDefs: FieldDefs;
  calcFields: TRowCalcFunc | undefined;
  data: Data;
  status: TStatus;
  currentRow: number;
  sortFields: SortFields;
  allRowsSelected: boolean;
  selectedRows: boolean[];
  filter?: IFilter;
  savedData?: Data;
  searchStr?: string;
  foundRows?: FoundRows;
  groups?: IDataGroup[];
  aggregates?: IDataRow;
  masterLink?: IMasterLink;
  changed: number;
  locked?: boolean;
}

export class RecordSet {

  private readonly _params: IRecordSetParams;

  private constructor(params: IRecordSetParams) {
    if (!params.data.size && params.currentRow > 0) {
      throw new Error(`For an empty record set currentRow must be 0`);
    }
    params.currentRow = params.currentRow < 0 ? 0 : params.currentRow;

    this._params = params;

    if (this.size && params.currentRow >= this.size) {
      throw new Error("Invalid currentRow value");
    }
  }

  public static create(options: IRecordSetOptions): RecordSet{
    const withCalcFunc = options.fieldDefs.filter(fd => fd.calcFunc);

    if (withCalcFunc.length) {
      return new RecordSet({
        ...options,
        calcFields: (row: IDataRow): IDataRow => {
          const res = Object.assign({} as IDataRow, row);

          withCalcFunc.forEach(fd => (res[fd.fieldName] = fd.calcFunc!(res)));

          return res;
        },
        status: options.sequentially ? TStatus.PARTIAL : TStatus.FULL,
        currentRow: 0,
        sortFields: [],
        allRowsSelected: false,
        selectedRows: [],
        changed: 0
      });
    } else {
      return new RecordSet({
        ...options,
        status: options.sequentially ? TStatus.PARTIAL : TStatus.FULL,
        calcFields: undefined,
        currentRow: 0,
        sortFields: [],
        allRowsSelected: false,
        selectedRows: [],
        changed: 0
      });
    }
  }

  get params(): Readonly<IRecordSetParams> {
    return this._params;
  }

  get name() {
    return this._params.name;
  }

  get fieldDefs() {
    return this._params.fieldDefs;
  }

  get eq() {
    return this._params.eq;
  }

  get queryPhrase() {
    return this._params.queryPhrase;
  }

  get sql() {
    return this._params.sql;
  }

  get status() {
    return this._params.status;
  }

  get size() {
    if (this._params.groups && this._params.groups.length) {
      const lg = this._params.groups[this._params.groups.length - 1];
      return lg.rowIdx + this._getGroupRowCount(lg);
    } else {
      return this._params.data.size;
    }
  }

  get sortFields() {
    return this._params.sortFields;
  }

  get currentRow() {
    return this._params.currentRow;
  }

  get allRowsSelected() {
    return this._params.allRowsSelected;
  }

  get selectedRows() {
    return this._params.selectedRows;
  }

  get filter() {
    return this._params.filter;
  }

  get foundRows() {
    return this._params.foundRows;
  }

  get foundNodes(): FoundNodes | undefined {
    return this._params.foundRows && this._params.foundRows.reduce((c, r) => {
      if (r) {
        r.forEach(n => c.push(n));
      }
      return c;
    }, []);
  }

  get foundNodesCount() {
    return this._params.foundRows
      ? this._params.foundRows.reduce((c, r) => (r ? c + r.length : c), 0)
      : 0;
  }

  get searchStr() {
    return this._params.searchStr;
  }

  get aggregates() {
    if (this._params.aggregates) {
      return this._params.aggregates;
    }

    const aggFields = this._params.fieldDefs.filter(fd => fd.aggregator);

    if (aggFields.length) {
      const accumulator = aggFields.map(fd => ({
        fieldName: fd.fieldName,
        value: fd.aggregator!.init(),
        processRow: fd.aggregator!.processRow,
        getTotal: fd.aggregator!.getTotal
      }));

      for (let i = 0; i < this._params.data.size; i++) {
        accumulator.forEach(
          acc =>
            (acc.value = acc.processRow(
              this._getData(this._params.data, i, this._params.calcFields),
              acc.fieldName,
              acc.value
            ))
        );
      }

      this._params.aggregates = accumulator.reduce(
        (prev, acc) => {
          prev[acc.fieldName] = acc.getTotal(acc.value);
          return prev;
        },
        {} as IDataRow
      );
    }

    return this._params.aggregates;
  }

  get masterLink() {
    return this._params.masterLink;
  }

  get pk(): IFieldDef[] {
    let res: IFieldDef[] = [];

    if (this._params.eq) {
      this._params.eq.link.entity.pk.forEach( attr => {
        const eqf = this._params.eq!.link.fields.find( f => f.attribute === attr );
        if (eqf) {
          const pkfd = this._params.fieldDefs.find( fd => !!fd.eqfa && fd.eqfa.linkAlias === this._params.eq!.link.alias && fd.eqfa.attribute === attr.name );
          if (pkfd) {
            res.push(pkfd);
          }
        }
      });
    }

    return res;
  }

  get changed(): number {
    return this.params.changed;
  }

  get locked(): boolean {
    return !!this.params.locked;
  }

  private _checkFields(fields: INamedField[]) {
    const {fieldDefs} = this._params;
    fields.forEach(f => {
      if (!fieldDefs.find(fd => fd.fieldName === f.fieldName)) {
        throw new Error(`Unknown field ${f.fieldName}`);
      }
    });
  }

  private _getGroupRowCount(group: IDataGroup): number {
    const t = group.collapsed
      ? 0
      : group.subGroups.length
      ? group.subGroups.reduce((p, s) => p + this._getGroupRowCount(s), 0)
      : group.bufferCount;
    return 1 + t + (group.footer && !group.collapsed ? 1 : 0);
  }

  private _findGroup(
    groups: IDataGroup[],
    rIdx?: number
  ): { groupIdx: number; group: IDataGroup } {
    const rowIdx = rIdx === undefined ? this.currentRow : rIdx;

    const groupsCount = groups.length;

    if (!groupsCount) {
      throw new Error(`Data is not grouped`);
    }

    const fg = groups[0];
    const lg = groups[groupsCount - 1];

    if (
      rowIdx < fg.rowIdx ||
      rowIdx >= lg.rowIdx + this._getGroupRowCount(lg)
    ) {
      throw new Error(
        `findGroup: invalid row index ${rowIdx} (${fg.rowIdx}-${lg.rowIdx +
          this._getGroupRowCount(lg)})`
      );
    }

    let approxGroupIdx = Math.floor(
      (groupsCount * (rowIdx - fg.rowIdx)) /
        (lg.rowIdx + this._getGroupRowCount(lg) - fg.rowIdx)
    );

    while (approxGroupIdx > 0 && rowIdx < groups[approxGroupIdx].rowIdx) {
      approxGroupIdx--;
    }

    while (
      approxGroupIdx < groupsCount - 1 &&
      rowIdx >= groups[approxGroupIdx + 1].rowIdx
    ) {
      approxGroupIdx++;
    }

    const group = groups[approxGroupIdx];

    if (rowIdx > group.rowIdx && group.subGroups.length) {
      if (
        group.footer &&
        !group.collapsed &&
        rowIdx === group.rowIdx + this._getGroupRowCount(group) - 1
      ) {
        return { groupIdx: approxGroupIdx, group };
      } else {
        return this._findGroup(group.subGroups, rowIdx);
      }
    } else {
      return { groupIdx: approxGroupIdx, group };
    }
  }

  private _getData(
    data: Data,
    dataRowIdx: number,
    calcFields?: TRowCalcFunc
  ): IDataRow {
    if (dataRowIdx < 0 || dataRowIdx >= data.size) {
      throw new Error(`Invalid row idx ${dataRowIdx}`);
    }

    if (calcFields) {
      return calcFields(data.get(dataRowIdx));
    } else {
      return data.get(dataRowIdx);
    }
  }

  private _get(
    rIdx?: number,
    calcFields?: TRowCalcFunc
  ): IRow {
    const rowIdx = rIdx === undefined ? this.currentRow : rIdx;

    const {groups, data} = this._params;

    if (!groups || !groups.length) {
      return {
        data: this._getData(data, rowIdx, calcFields),
        type: TRowType.Data
      };
    }

    const group = this._findGroup(groups, rowIdx).group;

    if (rowIdx === group.rowIdx) {
      return {
        data: group.header,
        type: group.collapsed
          ? TRowType.HeaderCollapsed
          : TRowType.HeaderExpanded,
        group
      };
    }

    if (
      group.footer &&
      !group.collapsed &&
      rowIdx === group.rowIdx + this._getGroupRowCount(group) - 1
    ) {
      return {
        data: group.footer,
        type: TRowType.Footer,
        group
      };
    }

    return {
      data: this._getData(data, group.bufferIdx + rowIdx - group.rowIdx - 1, calcFields),
      type: TRowType.Data,
      group
    };
  }

  private _checkLocked() {
    if (this.locked) {
      throw new Error(`Recordset is locked.`);
    }
  }

  public pkValue(rIdx?: number): TDataType[] {
    if (!this.size) {
      throw new Error('RecordSet is empty');
    }

    const r = this._get(rIdx);

    if (r.type !== TRowType.Data) {
      throw new Error('No data row');
    }

    return this.pk.map( fd => r.data[fd.fieldName] as TDataType );
  }

  public pk2s(rIdx?: number): string[] {
    return this.pkValue(rIdx).map( v => v === null ? 'NULL' : v.toString() );
  }

  public insert(): RecordSet{
    this._checkLocked();

    const { data, groups, savedData, changed } = this.params;

    if (groups && groups.length) {
      const row = this._get();

      let group: IDataGroup;

      if (row.type === TRowType.HeaderExpanded || row.type === TRowType.HeaderCollapsed) {
        if (this.currentRow > 0) {
          group = this._findGroup(groups, this.currentRow - 1).group;
        } else {
          return this;
        }
      } else {
        group = this._findGroup(groups, this.currentRow).group;
      }

      if (group.bufferCount) {
        group.bufferCount++;
      }

      groups.forEach( g => {
        if (g.rowIdx >= this.currentRow) {
          g.rowIdx++;
        }

        if (g.bufferIdx > group.bufferIdx) {
          g.bufferIdx++;
        }
      });
    }

    const newRow = this.fieldDefs.reduce(
      (r, fd) => ({...r, [fd.fieldName]: null}),
      {} as IDataRow
    );

    newRow['$$ROW_STATE'] = TRowState.Inserted;

    return new RecordSet({
      ...this._params,
      data: data.insert(this._adjustIdx(this.currentRow), newRow),
      savedData: savedData ? savedData.push(newRow) : undefined,
      changed: changed + 1
    });
  }

  public delete(remove?: boolean, rIdxs?: number[], dontCheckLocked?: boolean): RecordSet{
    if (!dontCheckLocked) this._checkLocked();

    if (Array.isArray(rIdxs) && !rIdxs.length) {
      return this;
    }

    if (remove) {
      const rowIdxs = rIdxs === undefined ? [this.currentRow] : rIdxs.sort( (a, b) => b - a );

      let { data, currentRow, savedData, changed } = this.params;
      let selectedRows = [...this.params.selectedRows];
      const { groups } = this.params;

      rowIdxs.forEach( r => {
        if (r < 0 || r >= this.size) {
          throw new Error(`Invalid row index ${r}`);
        }

        if (this._get(r).type === TRowType.Data) {

          if (currentRow > r || currentRow === (this.size - 1)) {
            currentRow--;
          }

          selectedRows.splice(r, 1);

          const adjustedIdx = this._adjustIdx(r);

          if (groups && groups.length) {
            const group = this._findGroup(groups, r).group;

            if (group.bufferCount) {
              group.bufferCount--;
            }

            groups.forEach( g => {
              if (g.rowIdx >= r) {
                g.rowIdx--;
              }

              if (g.bufferIdx > adjustedIdx) {
                g.bufferIdx--;
              }
            });
          }

          if (savedData) {
            for (let i = savedData.size - 1; i >= 0; i--) {
              if (savedData.get(i) === data.get(adjustedIdx)) {
                savedData = savedData.delete(i);
                break;
              }
            }
          }

          if (data.get(adjustedIdx)['$$ROW_STATE'] !== undefined) {
            changed--;
          }

          data = data.delete(adjustedIdx);
        }
      });

      const res = new RecordSet({ ...this._params, data, currentRow, selectedRows, savedData, changed });

      if (this.params.foundRows) {
        return res.search(this.params.searchStr);
      }

      return res;
    } else {
      return this._setRowsState(TRowState.Deleted, rIdxs);
    }
  }

  public async post(commitFunc: TCommitFunc, unlock: boolean = true): Promise<RecordSet> {
    let res: RecordSet= this;

    for (let i = res.size - 1; i >= 0; i--) {
      const row = res._get(i);

      if (row.type !== TRowType.Data) {
        continue;
      }

      const rs = row.data['$$ROW_STATE'];

      if (rs) {
        switch (await commitFunc(row.data)) {
          case TCommitResult.Success: {
            if (rs === TRowState.Deleted) {
              res = res.delete(true, [i], true);
            } else {
              delete row.data['$$ROW_STATE'];
              delete row.data['$$PREV_ROW'];
              res = new RecordSet({
                ...res._params,
                changed: res.changed - 1
              });
            }
          }

          case TCommitResult.Cancel: {
            res = res.cancel(i, true);
            break;
          }

          case TCommitResult.Skip: {
            break;
          }

          case TCommitResult.Abort: {
            i = -1;
            break;
          }

          case TCommitResult.AbortCancelAll: {
            res = res.cancelAll(true);
            i = -1;
            break;
          }
        }
      }
    }

    if (unlock && res.locked) {
      return new RecordSet({
        ...res._params,
        locked: undefined
      });
    } else {
      return res;
    }
  }

  public cancelAll(dontCheckLocked?: boolean): RecordSet{
    if (!dontCheckLocked) this._checkLocked();

    let res: RecordSet= this;

    for (let i = res.size - 1; i >= 0; i--) {
      const row = res._get(i);

      if (row.type !== TRowType.Data) {
        continue;
      }

      if (row.data['$$ROW_STATE'] !== undefined) {
        res = res.cancel(i);
      }
    }

    return res;
  }

  public cancel(rowIdx?: number, dontCheckLocked?: boolean): RecordSet{
    if (!dontCheckLocked) this._checkLocked();

    if (!this.size) {
      throw new Error('Empty recordset.')
    }

    const r = rowIdx === undefined ? this.currentRow : rowIdx;
    const row = this._get(r);

    if (row.type !== TRowType.Data) {
      throw new Error('Not a data row.');
    }

    const { data, changed } = this.params;
    const adjustedIdx = this._adjustIdx(r);
    const rowData = data.get(adjustedIdx);
    const rs = rowData['$$ROW_STATE'];

    if (rs === TRowState.Deleted) {
      delete rowData['$$ROW_STATE'];
      return new RecordSet({
        ...this._params,
        data: data.set(adjustedIdx, rowData),
        changed: changed - 1
      });
    }

    if (rs === TRowState.Inserted) {
      return this.delete(true, [r]);
    }

    if (rowData['$$PREV_ROW']) {
      let { savedData } = this.params;

      if (savedData) {
        for (let i = savedData.size - 1; i >= 0; i--) {
          if (savedData.get(i) === rowData) {
            savedData = savedData.set(i, rowData['$$PREV_ROW'] as IDataRow)
            break;
          }
        }
      }

      return new RecordSet({
        ...this._params,
        data: data.set(adjustedIdx, rowData['$$PREV_ROW'] as IDataRow),
        savedData,
        changed: changed - 1
      });
    }

    return this;
  }

  public getFieldDef(fieldName: string): IFieldDef {
    const fd = this.fieldDefs.find(fd => fd.fieldName === fieldName);

    if (!fd) {
      throw new Error(`Unknown field ${fieldName}`);
    }

    return fd;
  }

  /**
   * Ищет записи по одному или нескольким заданным значениям полей. Возвращает массив индексов найденных записей или пустой массив, если ничего не найдено.
   * @param searchFor Или массив значений первичного ключа записи или объект со значениями полей типа { имя_поля: значение[, имя_поля2: значение ...] }
   * @param stopAtFirst Вернуть только первый найденный индекс.
   * @param startFrom Если задано, то начинает поиск с указанного индекса. Если не задано -- с текущей записи.
   * @param continueFromBegining Если startFrom > 0, то указывает надо ли просматривать RecordSet с начала, после достижения последней записи.
   */
  public locate(searchFor: IDataRow | TDataType[], stopAtFirst?: boolean, startFrom?: number, continueFromBegining: boolean = true): number[] {
    let res: number[] = [];

    const searchFields = Array.isArray(searchFor) ? this.pk.map( fd => fd.fieldName ) : Object.keys(searchFor);
    const searchValues = Array.isArray(searchFor) ? searchFor : Object.values(searchFor);

    let startIdx = startFrom === undefined ? this.currentRow : startFrom;
    let stopIdx = this.size;

    while (true) {
      for(let i = startIdx; i < stopIdx; i++) {
        if (this._get(i).type !== TRowType.Data) {
          continue;
        }

        let found = true;
        for(let j = 0; j < searchFields.length; j++) {
          if(searchValues[j] !== this.getValue(searchFields[j], i)) {
            found = false;
            break;
          }
        }

        if (found) {
          res.push(i);
          if (stopAtFirst) {
            return res;
          }
        }
      }

      if (!startIdx) {
        break;
      }

      if (continueFromBegining) {
        stopIdx = startIdx;
        startIdx = 0;
      } else {
        break;
      }
    }

    return res;
  }

  public get(rowIdx?: number): IRow {
    const {calcFields} = this._params;
    return this._get(rowIdx, calcFields);
  }

  public getValue(fieldName: string, rowIdx?: number, defaultValue?: TDataType): TDataType {
    const {calcFields} = this._params;
    return checkField(this._get(rowIdx, calcFields).data, fieldName, defaultValue);
  }

  public getString(fieldName: string, rowIdx?: number, defaultValue?: string, dateFormat? : IDateFormat, numberFormat?: INumberFormat): string {
    const {calcFields} = this._params;
    const fd = this.getFieldDef(fieldName);
    switch (fd.dataType) {
      case TFieldType.Float:
      case TFieldType.Integer:
      case TFieldType.Currency:
        return getAsString(
          this._get(rowIdx, calcFields).data,
          fieldName,
          defaultValue,
          numberFormat ? numberFormat : fd.numberFormat
        );
      case TFieldType.Date:
        return getAsString(
          this._get(rowIdx, calcFields).data,
          fieldName,
          defaultValue,
          undefined,
          dateFormat ? dateFormat : fd.dateFormat
        );
      default:
        return getAsString(this._get(rowIdx, calcFields).data, fieldName, defaultValue);
    }
  }

  public getInteger(fieldName: string, rowIdx?: number, defaultValue?: number): number {
    const {calcFields} = this._params;
    const res = getAsNumber(this._get(rowIdx, calcFields).data, fieldName, defaultValue);
    const fd = this.getFieldDef(fieldName);
    if (fd.dataType === TFieldType.Float || fd.dataType === TFieldType.Currency) {
      throw new Error(`Invalid type cast for field ${fieldName}`);
    }
    return res;
  }

  public getFloat(fieldName: string, rowIdx?: number, defaultValue?: number): number {
    const {calcFields} = this._params;
    return getAsNumber(this._get(rowIdx, calcFields).data, fieldName, defaultValue);
  }

  public getCurrency(fieldName: string, rowIdx?: number, defaultValue?: number): number {
    const {calcFields} = this._params;
    return getAsNumber(this._get(rowIdx, calcFields).data, fieldName, defaultValue);
  }

  public getBoolean(fieldName: string, rowIdx?: number, defaultValue?: boolean): boolean {
    const {calcFields} = this._params;
    return getAsBoolean(this._get(rowIdx, calcFields).data, fieldName, defaultValue);
  }

  public getDate(fieldName: string, rowIdx?: number, defaultValue?: Date): Date {
    const {calcFields} = this._params;
    return getAsDate(
      this._get(rowIdx, calcFields).data,
      fieldName,
      defaultValue
    );
  }

  public isNull(fieldName: string, rowIdx?: number): boolean {
    const {calcFields} = this._params;
    return isNull(this._get(rowIdx, calcFields).data, fieldName);
  }

  public getObject(fields?: string[], rIdx?: number): IDataRow {
    if (!this.size) {
      throw new Error('Empty recordset.')
    }

    const rowIdx = rIdx !== undefined ? rIdx : this.currentRow;

    if (this._get(rowIdx).type !== TRowType.Data) {
      throw new Error('Not a data row.');
    }

    const { data } = this.params;
    const adjustedIdx = this._adjustIdx(rowIdx);
    const rowData = data.get(adjustedIdx);

    if (fields && fields.length) {
      return fields.reduce(
        (p, f) => {
          p[f] = rowData[f];
          return p;
        }, {} as IDataRow
      )
    } else {
      return {...rowData};
    }
  }

  public set(newRowData: IDataRow, rIdx?: number, setRowState?: boolean): RecordSet{
    this._checkLocked();

    const rowIdx = rIdx !== undefined ? rIdx : this.currentRow;

    if (this.size && this._get(rowIdx).type !== TRowType.Data) {
      throw new Error('Not a data row.');
    }

    const { data } = this.params;
    let { changed } = this.params;
    const adjustedIdx = this._adjustIdx(rowIdx);
    const rowData = this.size ? data.get(adjustedIdx) : undefined;
    const rowState = rowData
      ? rowData['$$ROW_STATE'] === undefined
        ? TRowState.Normal
        : rowData['$$ROW_STATE']
      : TRowState.Normal;

    if (rowState === TRowState.Deleted) {
      throw new Error(`Can't edit deleted row.`)
    }

    if (!setRowState) {
      if (rowState !== TRowState.Normal) {
        changed--;
      }
      delete newRowData['$$PREV_ROW'];
      delete newRowData['$$ROW_STATE'];
    } else {
      if (rowState === TRowState.Inserted) {
        delete newRowData['$$PREV_ROW'];
        newRowData['$$ROW_STATE'] = TRowState.Inserted;
      } else {
        if (rowState === TRowState.Normal) {
          changed++;
        }
        if (rowData) {
          delete rowData['$$PREV_ROW'];
          delete rowData['$$ROW_STATE'];
          newRowData['$$PREV_ROW'] = rowData;
        }
        newRowData['$$ROW_STATE'] = rowData ? TRowState.Edited : TRowState.Inserted;
      }
    }

    return new RecordSet({
      ...this.params,
      data: data.set(adjustedIdx, newRowData),
      changed
    })
  }

  private _setFieldValue(fieldName: string, value: TDataType, rIdx?: number): RecordSet{
    this._checkLocked();

    if (!this.size) {
      throw new Error('Empty recordset.')
    }

    const rowIdx = rIdx !== undefined ? rIdx : this.currentRow;

    if (this._get(rowIdx).type !== TRowType.Data) {
      throw new Error('Not a data row.');
    }

    const { data } = this.params;
    let { changed } = this.params;
    const adjustedIdx = this._adjustIdx(rowIdx);
    const rowData = data.get(adjustedIdx);
    const rs = rowData['$$ROW_STATE'];

    if (rs === TRowState.Deleted) {
      throw new Error(`Can't edit deleted row.`)
    }

    if (rs !== TRowState.Inserted) {
      if (!rowData['$$PREV_ROW']) {
        rowData['$$PREV_ROW'] = {...rowData};
        changed++;
      }
      rowData['$$ROW_STATE'] = TRowState.Edited;
    }

    rowData[fieldName] = value;

    return new RecordSet({
      ...this.params,
      data: data.set(adjustedIdx, rowData),
      changed
    })
  }

  public setValue(fieldName: string, value: TDataType, rIdx?: number): RecordSet{
    if (value === null) {
      return this.setNull(fieldName, rIdx);
    }

    switch (typeof value) {
      case 'number':
        if (value === Math.trunc(value)) {
          return this.setInteger(fieldName, value, rIdx);
        } else {
          return this.setFloat(fieldName, value, rIdx);
        }

      case 'string':
        return this.setString(fieldName, value, rIdx);

      case 'boolean':
        return this.setBoolean(fieldName, value, rIdx);

      default:
        if (value instanceof Date) {
          return this.setDate(fieldName, value, rIdx);
        } else {
          throw new Error('Unknown data type.');
        }
    }
  }

  public setDate(fieldName: string, value: Date, rIdx?: number): RecordSet{
    switch (this.getFieldDef(fieldName).dataType) {
      case TFieldType.Integer:
      case TFieldType.Float:
      case TFieldType.Currency:
        return this._setFieldValue(fieldName, value.getTime(), rIdx);

      case TFieldType.String:
        return this._setFieldValue(fieldName, value.toString(), rIdx);

      case TFieldType.Boolean:
        return this._setFieldValue(fieldName, true, rIdx);

      case TFieldType.Date:
        return this._setFieldValue(fieldName, value, rIdx);
    }
  }

  public setBoolean(fieldName: string, value: boolean, rIdx?: number): RecordSet{
    switch (this.getFieldDef(fieldName).dataType) {
      case TFieldType.Integer:
      case TFieldType.Float:
      case TFieldType.Currency:
        return this._setFieldValue(fieldName, value ? 1 : 0, rIdx);

      case TFieldType.String:
        return this._setFieldValue(fieldName, value ? 'TRUE' : 'FALSE', rIdx);

      case TFieldType.Boolean:
        return this._setFieldValue(fieldName, value, rIdx);

      case TFieldType.Date:
        throw new Error(`Invalid type cast.`);
    }
  }

  public setInteger(fieldName: string, value: number, rIdx?: number): RecordSet{
    if (value !== Math.trunc(value)) {
      throw new Error(`Not an integer value.`);
    }

    switch (this.getFieldDef(fieldName).dataType) {
      case TFieldType.Integer:
      case TFieldType.Float:
      case TFieldType.Currency:
        return this._setFieldValue(fieldName, value, rIdx);

      case TFieldType.String:
        return this._setFieldValue(fieldName, value.toString(), rIdx);

      case TFieldType.Boolean:
        return this._setFieldValue(fieldName, !!value, rIdx);

      case TFieldType.Date:
        return this._setFieldValue(fieldName, new Date(value), rIdx);
    }
  }

  public setFloat(fieldName: string, value: number, rIdx?: number): RecordSet{
    switch (this.getFieldDef(fieldName).dataType) {
      case TFieldType.Integer:
        throw new Error(`Invalid type cast for field ${fieldName}`);

      case TFieldType.Float:
      case TFieldType.Currency:
        return this._setFieldValue(fieldName, value, rIdx);

      case TFieldType.String:
        return this._setFieldValue(fieldName, value.toString(), rIdx);

      case TFieldType.Boolean:
        return this._setFieldValue(fieldName, !!value, rIdx);

      case TFieldType.Date:
        return this._setFieldValue(fieldName, new Date(value), rIdx);
    }
  }

  public setCurrency(fieldName: string, value: number, rIdx?: number): RecordSet{
    return this.setFloat(fieldName, value, rIdx);
  }

  public setString(fieldName: string, value: string, rIdx?: number): RecordSet{
    switch (this.getFieldDef(fieldName).dataType) {
      case TFieldType.Integer: {
        const v = Number(value);

        if (isNaN(v) || !value || v !== Math.trunc(v)) {
          throw new Error(`Invalid type cast`);
        }

        return this._setFieldValue(fieldName, v, rIdx);
      }

      case TFieldType.Float:
      case TFieldType.Currency: {
        const v = Number(value);

        if (isNaN(v) || !value) {
          throw new Error(`Invalid type cast`);
        }

        return this._setFieldValue(fieldName, v, rIdx);
      }

      case TFieldType.String:
        return this._setFieldValue(fieldName, value, rIdx);

      case TFieldType.Boolean:
        if (value === 'TRUE') {
          return this._setFieldValue(fieldName, true, rIdx);
        }
        else if (value === 'FALSE') {
          return this._setFieldValue(fieldName, false, rIdx);
        }
        else {
          const v = Number(value);

          if (value && !isNaN(v)) {
            return this._setFieldValue(fieldName, !!v, rIdx);
          } else {
            throw new Error(`Invalid type cast.`)
          }
        }

      case TFieldType.Date:
        if (value === '') {
          return this.setNull(fieldName, rIdx);
        }
        if (isNaN(Date.parse(value))) {
          throw new Error(`Invalid type cast.`);
        }
        return this._setFieldValue(fieldName, new Date(value), rIdx);
    }
  }

  public setNull(fieldName: string, rIdx?: number): RecordSet{
    const fd = this.getFieldDef(fieldName);

    if (fd.required) {
      throw new Error(`Field ${fieldName} cann't be null`);
    }

    return this._setFieldValue(fieldName, null, rIdx);
  }

  public toArray(): IRow[] {
    const res: IRow[] = [];
    const size = this.size;

    for (let i = 0; i < size; i++) {
      res.push(this.get(i));
    }

    return res;
  }

  public indexOf(row: IRow): number {
    const size = this.size;
    for (let i = 0; i < size; i++) {
      if (this.get(i) === row) {
        return i;
      }
    }
    return -1;
  }

  private _cloneGroups(
    parent: IDataGroup | undefined,
    groups: IDataGroup[],
    cloneGroup: CloneGroup
  ): IDataGroup[] {
    const res: IDataGroup[] = [];
    let prev: IDataGroup | undefined = undefined;
    groups.forEach(g => {
      const cloned = cloneGroup(parent, prev, g);
      if (cloned.subGroups.length) {
        cloned.subGroups = this._cloneGroups(cloned, g.subGroups, cloneGroup);
      }
      res.push(cloned);
      prev = cloned;
    });
    return res;
  }

  public toggleGroup(rowIdx: number): RecordSet{
    this._checkLocked();

    const {groups} = this._params;

    if (!groups || !groups.length) {
      throw new Error(`Data is not grouped`);
    }

    const fg = this._findGroup(groups, rowIdx);

    return new RecordSet({
      ...this._params,
      currentRow: fg.group.rowIdx,
      selectedRows: [],
      groups: this._cloneGroups(undefined, groups, (parent, prev, g) => {
        return g.rowIdx < fg.group.rowIdx
          ? g
          : g.rowIdx === fg.group.rowIdx
          ? { ...g, collapsed: !g.collapsed }
          : {
              ...g,
              rowIdx: prev
                ? prev.rowIdx + this._getGroupRowCount(prev)
                : parent
                ? parent.rowIdx + 1
                : 0
            };
      })
    });
  }

  public sort(sortFields: SortFields, dimension?: SortFields, measures?: Measures): RecordSet{
    this._checkLocked();

    if (this.status !== TStatus.FULL) {
      throw new Error(`Can't sort partially loaded recordset`);
    }

    this._checkFields(sortFields);

    if (!this._params.data.size) {
      return this;
    }

    if (!sortFields.length) {
      return new RecordSet({
        ...this._params,
        sortFields: [],
        searchStr: undefined,
        foundRows: undefined,
        groups: undefined
      });
    }

    const currentRowData = this.get(this._params.currentRow);
    const selectedRowsData = this._params.selectedRows.reduce(
      (p, sr, idx) => {
        if (sr) {
          p.push(this.get(idx));
        }
        return p;
      },
      [] as IRow[]
    );

    const combinedSort = dimension ? sortFields.concat(dimension) : sortFields;

    const sortOnCalcFields = combinedSort.some(
      sf =>
        !!this._params.fieldDefs.find(fd => fd.fieldName === sf.fieldName && !!fd.calcFunc)
    );

    let fieldDefs = this._params.fieldDefs;
    let calcFields = this._params.calcFields;
    let sorted = (sortOnCalcFields
      ? this._params.data.sort((a, b) => {
          const calcA = this._params.calcFields!(a);
          const calcB = this._params.calcFields!(b);
          return combinedSort.reduce(
            (p, f) =>
              p
                ? p
                : calcA[f.fieldName]! < calcB[f.fieldName]!
                ? f.asc
                  ? -1
                  : 1
                : calcA[f.fieldName]! > calcB[f.fieldName]!
                ? f.asc
                  ? 1
                  : -1
                : 0,
            0
          );
        })
      : this._params.data.sort((a, b) =>
          combinedSort.reduce(
            (p, f) =>
              p
                ? p
                : a[f.fieldName]! < b[f.fieldName]!
                ? f.asc
                  ? -1
                  : 1
                : a[f.fieldName]! > b[f.fieldName]!
                ? f.asc
                  ? 1
                  : -1
                : 0,
            0
          )
        )
    ).toList();

    if (dimension && measures) {
      const newFieldDefs: IFieldDef[] = [];
      const newData: IDataRow[] = [];

      const calcSlice = (
        level: number,
        initialRowIdx: number,
        size: number,
        newRow: IDataRow,
        olapValue: TDataType[],
        upSuffix: string
      ): IDataRow => {
        const fieldName = dimension[level].fieldName;
        let rowIdx = initialRowIdx;
        let left = size;

        while (left > 0) {
          let cnt = 0;
          const row = this._getData(sorted, rowIdx + cnt, calcFields);
          const value = row[fieldName] as TDataType;
          const valueFieldDef = this._params.fieldDefs.find(fd => fd.fieldName === fieldName)!;
          while (
            cnt < left &&
            this._getData(sorted, rowIdx + cnt, calcFields)[fieldName] === value
          ) {
            cnt++;
          }
          const fieldNameSuffix = `${upSuffix}[${
            value === null ? "null" : value.toString()
          }]`;
          measures.forEach(m => {
            const measureFieldName = `[${m.fieldName}]${fieldNameSuffix}`;
            if (!newFieldDefs.find(fd => fd.fieldName === measureFieldName)) {
              newFieldDefs.push({
                fieldName: measureFieldName,
                dataType: valueFieldDef.dataType,
                caption: value === null ? "null" : value.toString(),
                olapValue: [...olapValue, value]
              });
            }
            newRow[measureFieldName] = m.measureCalcFunc(
              idx => this._getData(sorted, idx, calcFields),
              rowIdx,
              cnt
            );
          });
          if (level < dimension.length - 1) {
            calcSlice(
              level + 1,
              rowIdx,
              cnt,
              newRow,
              [...olapValue, value],
              fieldNameSuffix
            );
          }
          left -= cnt;
          rowIdx += cnt;
        }

        return newRow;
      };

      const groupSlice = (level: number, initialRowIdx: number): number => {
        const fieldName = sortFields[level].fieldName;
        let rowIdx = initialRowIdx;

        while (rowIdx < sorted.size) {
          let cnt = 0;
          let row = this._getData(sorted, rowIdx + cnt, calcFields);
          let value = row[fieldName];
          while (
            rowIdx + cnt < sorted.size &&
            this._getData(sorted, rowIdx + cnt, calcFields)[fieldName] === value
          ) {
            if (level < sortFields.length - 1) {
              cnt += groupSlice(level + 1, rowIdx + cnt);
            } else {
              cnt++;
            }
          }
          if (level === sortFields.length - 1) {
            newData.push(
              calcSlice(
                0,
                rowIdx,
                cnt,
                sortFields.reduce(
                  (r, sf) => {
                    r[sf.fieldName] = row[sf.fieldName];
                    return r;
                  },
                  {} as IDataRow
                ),
                [],
                ""
              )
            );
          }
          if (level) {
            return cnt;
          }
          rowIdx += cnt;
        }

        return sorted.size;
      };

      groupSlice(0, 0);

      sorted = List<IDataRow>(newData);
      newFieldDefs.sort((a, b) => {
        if (a.olapValue && b.olapValue) {
          for (
            let i = 0;
            i < a.olapValue.length && i < b.olapValue.length;
            i++
          ) {
            const av = a.olapValue[i];
            const bv = b.olapValue[i];
            const res =
              av === bv
                ? 0
                : av === null || av === undefined
                ? -1
                : bv === null || bv === undefined
                ? 1
                : av < bv
                ? -1
                : 1;
            if (res) return res;
          }
          return a.olapValue.length - b.olapValue.length;
        } else {
          return 0;
        }
      });
      fieldDefs = [
        ...sortFields.map(
          sf => this._params.fieldDefs.find(fd => fd.fieldName === sf.fieldName)!
        ),
        ...newFieldDefs
      ];

      if (calcFields) {
        const withCalcFunc = fieldDefs.filter(fd => fd.calcFunc);

        if (withCalcFunc.length) {
          calcFields = (row: IDataRow): IDataRow => {
            const res = Object.assign({} as IDataRow, row);

            withCalcFunc.forEach(fd => (res[fd.fieldName] = fd.calcFunc!(res)));

            return res;
          };
        } else {
          calcFields = undefined;
        }
      }
    }

    if (sortFields[0].groupBy) {
      const groupData = (
        level: number,
        initialRowIdx: number,
        bufferIdx: number,
        bufferSize: number
      ) => {
        const res: IDataGroup[] = [];
        const fieldName = sortFields[level].fieldName;
        let rowIdx = initialRowIdx;
        let bufferBeginIdx = bufferIdx;

        while (bufferBeginIdx < bufferIdx + bufferSize) {
          let bufferEndIdx = bufferBeginIdx;
          let value = this._getData(sorted, bufferBeginIdx, calcFields)[
            fieldName
          ];

          while (
            bufferEndIdx < bufferIdx + bufferSize &&
            this._getData(sorted, bufferEndIdx, calcFields)[fieldName] === value
          ) {
            bufferEndIdx++;
          }

          const bufferCount = bufferEndIdx - bufferBeginIdx;

          if (bufferCount > 0) {
            const headerData = this._getData(
              sorted,
              bufferBeginIdx,
              calcFields
            );
            const header: IDataRow = { [fieldName]: headerData[fieldName] } as IDataRow;
            let footer;

            if (sortFields[level].calcAggregates) {
              const aggFields = this._params.fieldDefs.filter(fd => fd.aggregator);

              if (aggFields.length) {
                const accumulator = aggFields.map(fd => ({
                  fieldName: fd.fieldName,
                  value: fd.aggregator!.init(),
                  processRow: fd.aggregator!.processRow,
                  getTotal: fd.aggregator!.getTotal
                }));

                for (
                  let i = bufferBeginIdx;
                  i < bufferBeginIdx + bufferCount;
                  i++
                ) {
                  accumulator.forEach(
                    acc =>
                      (acc.value = acc.processRow(
                        this._getData(sorted, i, this._params.calcFields),
                        acc.fieldName,
                        acc.value
                      ))
                  );
                }

                footer = accumulator.reduce(
                  (prev, acc) => {
                    prev[acc.fieldName] = acc.getTotal(acc.value);
                    return prev;
                  },
                  {} as IDataRow
                );
              }
            }

            const group = {
              header,
              level,
              collapsed: false,
              subGroups:
                sortFields.length > level + 1 && sortFields[level + 1].groupBy
                  ? groupData(
                      level + 1,
                      rowIdx + 1,
                      bufferBeginIdx,
                      bufferCount
                    )
                  : [],
              footer,
              rowIdx: rowIdx,
              bufferIdx: bufferBeginIdx,
              bufferCount
            };
            res.push(group);
            rowIdx += this._getGroupRowCount(group);
          }

          bufferBeginIdx = bufferEndIdx;
        }

        return res;
      };

      const groups = groupData(0, 0, 0, sorted.size);

      return new RecordSet({
        ...this._params,
        fieldDefs,
        calcFields,
        data: sorted,
        currentRow: 0,
        sortFields,
        allRowsSelected: false,
        selectedRows: [],
        searchStr: undefined,
        foundRows: undefined,
        groups
      });
    }

    const res = new RecordSet({
      ...this._params,
      fieldDefs,
      calcFields,
      data: sorted,
      currentRow: 0,
      sortFields,
      selectedRows: [],
      searchStr: undefined,
      foundRows: undefined,
      groups: undefined
    });

    const foundIdx = res.indexOf(currentRowData);
    if (foundIdx >= 0) {
      res._params.currentRow = foundIdx;
    }

    res._params.selectedRows = selectedRowsData.reduce(
      (p, srd) => {
        if (srd) {
          const fi = res.indexOf(srd);
          if (fi >= 0) {
            p[fi] = true;
          }
        }
        return p;
      },
      [] as boolean[]
    );

    return res;
  }

  public collapseExpandGroups(collapse: boolean): RecordSet{
    this._checkLocked();

    if (!this._params.groups) {
      throw new Error(`Not in grouping mode`);
    }

    return new RecordSet({
      ...this._params,
      currentRow: 0,
      selectedRows: [],
      searchStr: undefined,
      foundRows: undefined,
      groups: this._cloneGroups(undefined, this._params.groups, (parent, prev, g) => {
        if (prev) {
          return {
            ...g,
            rowIdx: prev.rowIdx + this._getGroupRowCount(prev),
            collapsed: collapse
          };
        } else if (parent) {
          return { ...g, rowIdx: parent.rowIdx + 1, collapsed: collapse };
        } else {
          return { ...g, rowIdx: 0, collapsed: collapse };
        }
      })
    });
  }

  public moveBy(delta: number): RecordSet{
    this._checkLocked();

    if (!this.size) {
      return this;
    }

    let newCurrentRow = this._params.currentRow + delta;
    if (newCurrentRow >= this.size) newCurrentRow = this.size - 1;
    if (newCurrentRow < 0) newCurrentRow = 0;

    return this.setCurrentRow(newCurrentRow);
  }

  public setCurrentRow(currentRow: number): RecordSet{
    this._checkLocked();

    if (!this.size || this._params.currentRow === currentRow) {
      return this;
    }

    if (currentRow < 0 || currentRow >= this.size) {
      throw new Error(`Invalid row index`);
    }

    return new RecordSet({
      ...this._params,
      currentRow
    });
  }

  public setAllRowsSelected(value: boolean): RecordSet{
    this._checkLocked();

    if (value === this.allRowsSelected) {
      return this;
    }

    return new RecordSet({
      ...this._params,
      allRowsSelected: value,
      selectedRows: value ? [] : this._params.selectedRows
    });
  }

  public selectRow(idx: number, selected: boolean): RecordSet{
    this._checkLocked();

    if (idx < 0 || idx >= this.size) {
      throw new Error(`Invalid row index`);
    }

    if (selected && (this.allRowsSelected || this.selectedRows[idx])) {
      return this;
    }

    const selectedRows = this.allRowsSelected
      ? Array(this.size).fill(true)
      : [...this._params.selectedRows];

    const row = this.get(idx);
    selectedRows[idx] = selected || undefined;

    if (row.type === TRowType.HeaderExpanded) {
      selectedRows[idx] = selected || undefined;

      for (let i = 1; i <= row.group!.bufferCount; i++) {
        selectedRows[idx + i] = selectedRows[idx];
      }
    }

    const allRowsSelected =
      this.size === selectedRows.reduce((p, sr) => (sr ? p + 1 : p), 0);

    return new RecordSet({
      ...this._params,
      allRowsSelected,
      selectedRows: allRowsSelected ? [] : selectedRows
    });
  }

  public getRowState(rowIdx?: number): TRowState {
    const rs = this._get(rowIdx).data['$$ROW_STATE'];
    if (rs === undefined) {
      return TRowState.Normal;
    } else {
      return rs as TRowState;
    }
  }

  private _adjustIdx(rowIdx: number): number {
    const { groups } = this._params;

    if (groups && groups.length) {
      const group = this._findGroup(groups, rowIdx).group;
      return group.bufferIdx + rowIdx - group.rowIdx - 1;
    } else {
      return rowIdx;
    }
  }

  private _setRowsState(state: TRowState, rIdxs?: number[]): RecordSet{
    const rowIdxs = rIdxs === undefined ? [this.currentRow] : rIdxs;

    let { data, changed } = this.params;

    rowIdxs.forEach( r => {
      if (this._get(r).type !== TRowType.Data) {
        throw new Error(`Not a data row. Row index: ${r}`);
      }

      const adjustedIdx = this._adjustIdx(r);
      const row = data.get(adjustedIdx);

      if (state === TRowState.Normal) {
        if (row['$$ROW_STATE'] !== undefined) {
          if (row['$$ROW_STATE'] !== TRowState.Normal) {
            changed--;
          }
          delete row['$$ROW_STATE'];
        }
      } else {
        if (row['$$ROW_STATE'] === undefined) {
          changed++;
          row['$$ROW_STATE'] = state;
        }
        else if (row['$$ROW_STATE'] !== state) {
          throw new Error(`Can't change state of row with index ${r}.`);
        }
      }
      data = data.set(adjustedIdx, row);
    });

    return new RecordSet({ ...this._params, data, changed });
  }

  public setFilter(filter: IFilter | undefined): RecordSet{
    this._checkLocked();

    if (this.status !== TStatus.FULL) {
      throw new Error(`Can't filter partially loaded recordset`);
    }

    if (equal(this._params.filter, filter)) {
      return this;
    }

    const isFilter = filter && filter.conditions.length;
    const currentRowData = this.size ? this.get(this.currentRow) : undefined;
    const selectedRowsData = this._params.allRowsSelected
      ? this.toArray()
      : this._params.selectedRows.reduce(
          (p, sr, idx) => {
            if (sr) {
              p.push(this.get(idx));
            }
            return p;
          },
          [] as IRow[]
        );

    let newData: Data;

    if (isFilter) {
      const re = new RegExp(filter!.conditions[0].value, "i");
      newData = (this._params.savedData || this._params.data)
        .filter(row =>
          row
            ? Object.entries(row).some(
                ([_, value]) => value !== null && re.test(value.toString())
              )
            : false
        )
        .toList();
    } else {
      if (!this._params.savedData) {
        throw new Error("No saved data for RecordSet");
      }
      newData = this._params.savedData;
    }

    const res = new RecordSet({
      ...this._params,
      data: newData,
      currentRow: 0,
      sortFields: [],
      allRowsSelected: false,
      selectedRows: [],
      filter: isFilter ? filter : undefined,
      savedData: isFilter ? this._params.savedData || this._params.data : undefined,
      searchStr: undefined,
      foundRows: undefined,
      groups: undefined,
      aggregates: undefined
    });

    const foundIdx = currentRowData ? this.indexOf(currentRowData) : -1;
    if (foundIdx >= 0) {
      res._params.currentRow = foundIdx;
    }

    res._params.selectedRows = selectedRowsData.reduce(
      (p, srd) => {
        if (srd) {
          const fi = this.indexOf(srd);
          if (fi >= 0) {
            p[fi] = true;
          }
        }
        return p;
      },
      [] as boolean[]
    );

    return res;
  }

  public isFiltered = (): boolean =>
    !!this._params.filter &&
    !!this._params.filter.conditions.length &&
    !!this._params.filter.conditions[0].value;

  public search(searchStr: string | undefined): RecordSet{
    if (!searchStr) {
      return new RecordSet({
        ...this._params,
        searchStr: undefined,
        foundRows: undefined
      });
    }

    const re = RegExp(searchStr, "i");
    const foundRows: FoundRows = [];
    let foundIdx = 1;

    for (let rowIdx = 0; rowIdx < this.size; rowIdx++) {
      const v = this.get(rowIdx).data;
      const foundNodes: FoundNodes = [];
      Object.entries(v).forEach(([fieldName, fieldValue]) => {
        if (!fieldValue) return;

        const s = fieldValue.toString();
        let b = 0;
        let m = re.exec(s);

        while (m !== null) {
          foundNodes.push({
            rowIdx,
            fieldName,
            matchStart: m.index + b,
            matchLen: m[0].length,
            foundIdx: foundIdx++
          });
          b += m.index + m[0].length;
          m = re.exec(s.substr(b));
        }
      });
      if (foundNodes.length) {
        foundRows[rowIdx] = foundNodes;
      }
    }

    return new RecordSet({
      ...this._params,
      searchStr,
      foundRows: foundRows.length ? foundRows : undefined
    });
  }

  public splitMatched(row: number, fieldName: string): IMatchedSubString[] {
    if (row < 0 || row >= this.size) {
      throw new Error(`splitMatched: invalid row index ${row}`);
    }

    const rowData = this.get(row).data;
    const s = rowData[fieldName] ? rowData[fieldName]!.toString() : "";

    if (this._params.foundRows && this._params.foundRows[row]) {
      const foundNodes = this._params.foundRows[row].filter(
        fn => fn.fieldName === fieldName
      );

      if (foundNodes.length) {
        const res: IMatchedSubString[] = [];
        let b = 0;
        foundNodes.forEach(fn => {
          if (b < fn.matchStart) {
            res.push({
              str: s.substr(b, fn.matchStart - b)
            });
          }
          res.push({
            str: s.substr(fn.matchStart, fn.matchLen),
            foundIdx: fn.foundIdx
          });
          b = fn.matchStart + fn.matchLen;
        });
        if (b < s.length) {
          res.push({
            str: s.substr(b)
          });
        }
        return res;
      }
    }

    if (this.isFiltered()) {
      const re = new RegExp(this._params.filter!.conditions[0].value, "i");
      const res: IMatchedSubString[] = [];
      let l = 0;
      let m = re.exec(s);

      while (m !== null) {
        if (m.index) {
          res.push({ str: m.input.substr(0, m.index) });
          l = l + m.index;
        }
        res.push({
          str: m.input.substr(m.index, m[0].length),
          matchFilter: true
        });
        l = l + m[0].length;
        m = re.exec(m.input.substr(m.index + m[0].length));
      }

      if (res.length) {
        if (l < s.length) {
          res.push({ str: s.substr(l) });
        }
        return res;
      }
    }

    return [{ str: s }];
  }

  public setData(options: IRecordSetDataOptions): RecordSet{
    this._checkLocked();

    switch (this._params.status) {
      case TStatus.LOADING:
        throw new Error("RecordSet is being loaded");
      case TStatus.PARTIAL:
      case TStatus.FULL:
      default:
        return new RecordSet({
          ...this._params,
          data: options.data,
          status: TStatus.FULL,
          currentRow: 0,
          sortFields: [],
          allRowsSelected: false,
          selectedRows: [],
          filter: undefined,
          savedData: undefined,
          searchStr: undefined,
          foundRows: undefined,
          groups: undefined,
          aggregates: undefined,
          masterLink: options.masterLink || this._params.masterLink
        });
    }
  }

  public loadingData(): RecordSet{
    this._checkLocked();

    switch (this._params.status) {
      case TStatus.FULL:
        throw new Error("RecordSet is a completely loaded");
      case TStatus.LOADING:
        throw new Error("RecordSet is being loaded");
      case TStatus.PARTIAL:
      default:
        return new RecordSet({
          ...this._params,
          status: TStatus.LOADING
        });
    }
  }

  public addData(records: IDataRow[], full?: boolean): RecordSet{
    this._checkLocked();

    switch (this._params.status) {
      case TStatus.FULL:
        throw new Error("RecordSet is a completely loaded");
      case TStatus.PARTIAL:
        throw new Error("RecordSet is being loaded");
      case TStatus.LOADING:
      default:
        return new RecordSet({
          ...this._params,
          data: this._params.data.push(...records),
          status: full ? TStatus.FULL : TStatus.PARTIAL
        });
    }
  }

  public setLocked(locked: boolean): RecordSet{
    return new RecordSet({
      ...this._params,
      locked
    });
  }
}
