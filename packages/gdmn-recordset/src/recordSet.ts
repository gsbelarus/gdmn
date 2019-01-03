import { IDataRow, FieldDefs, SortFields, INamedField, IMatchedSubString, FoundRows, FoundNodes, IDataGroup, TRowType, IRow, TRowCalcFunc, CloneGroup, Data, Measures, IFieldDef, TDataType, TFieldType, IMasterLink } from "./types";
import { IFilter } from "./filter";
import { List } from "immutable";
import equal from "fast-deep-equal";
import { getAsString, getAsNumber, getAsBoolean, getAsDate, isNull, checkField } from "./utils";
import { Subject } from "rxjs";

export type RecordSetEvent = 'AfterScroll' | 'BeforeScroll';

export type RecordSetEventData<R extends IDataRow = IDataRow> = { event: RecordSetEvent, rs: RecordSet<R> };

export interface IRecordSetParams<R extends IDataRow = IDataRow> {
  name: string,
  fieldDefs: FieldDefs,
  calcFields: TRowCalcFunc<R> | undefined,
  data: Data<R>,
  currentRow: number,
  sortFields: SortFields,
  allRowsSelected: boolean,
  selectedRows: boolean[],
  filter?: IFilter,
  savedData?: Data<R>,
  searchStr?: string,
  foundRows?: FoundRows,
  groups?: IDataGroup<R>[],
  aggregates?: R,
  masterLink?: IMasterLink,
  subject: Subject<RecordSetEventData<R>>
}

export class RecordSet<R extends IDataRow = IDataRow> {
  readonly name: string;
  private _fieldDefs: FieldDefs;
  private _calcFields: TRowCalcFunc<R> | undefined;
  private _data: Data<R>;
  private _currentRow: number;
  private _sortFields: SortFields;
  private _allRowsSelected: boolean;
  private _selectedRows: boolean[];
  private _filter?: IFilter;
  private _savedData?: Data<R>;
  private _searchStr?: string;
  private _foundRows?: FoundRows;
  private _groups?: IDataGroup<R>[];
  private _aggregates?: R;
  private _masterLink?: IMasterLink;
  private _subject: Subject<RecordSetEventData<R>>;

  private constructor (params: IRecordSetParams<R>)
  {
    const { name, fieldDefs, calcFields, data, currentRow, sortFields, allRowsSelected,
      selectedRows, filter, savedData, searchStr, foundRows, groups, aggregates, masterLink,
      subject } = params;

    if (!data.size && currentRow > 0) {
      throw new Error(`For an empty record set currentRow must be 0`);
    }

    this.name = name;
    this._fieldDefs = fieldDefs;
    this._calcFields = calcFields;
    this._data = data;
    this._currentRow = currentRow < 0 ? 0 : currentRow;
    this._sortFields = sortFields;
    this._allRowsSelected = allRowsSelected;
    this._selectedRows = selectedRows;
    this._filter = filter;
    this._savedData = savedData;
    this._searchStr = searchStr;
    this._foundRows = foundRows;
    this._groups = groups;
    this._aggregates = aggregates;
    this._masterLink = masterLink;
    this._subject = subject;

    if (this.size && currentRow >= this.size) {
      throw new Error('Invalid currentRow value');
    }
  }

  public static createWithData<R extends IDataRow = IDataRow>(
    name: string,
    fieldDefs: FieldDefs,
    data: Data<R>,
    masterLink?: IMasterLink): RecordSet<R>
  {
    const withCalcFunc = fieldDefs.filter( fd => fd.calcFunc );

    if (withCalcFunc.length) {
      return new RecordSet<R>({
        name,
        fieldDefs,
        calcFields: (row: R): R => {
          const res = Object.assign({} as R, row);

          withCalcFunc.forEach(
            fd => res[fd.fieldName] = fd.calcFunc!(res)
          );

          return res;
        },
        data,
        currentRow: 0,
        sortFields: [],
        allRowsSelected: false,
        selectedRows: [],
        masterLink,
        subject: new Subject<RecordSetEventData<R>>()
      });
    } else {
      return new RecordSet<R>({
        name,
        fieldDefs,
        calcFields: undefined,
        data,
        currentRow: 0,
        sortFields: [],
        allRowsSelected: false,
        selectedRows: [],
        masterLink,
        subject: new Subject<RecordSetEventData<R>>()
      });
    }
  }

  get params(): IRecordSetParams<R> {
    return {
      name: this.name,
      fieldDefs: this._fieldDefs,
      calcFields: this._calcFields,
      data: this._data,
      currentRow: this._currentRow,
      sortFields: this._sortFields,
      allRowsSelected: this._allRowsSelected,
      selectedRows: this._selectedRows,
      filter: this._filter,
      savedData: this._savedData,
      searchStr: this._searchStr,
      foundRows: this._foundRows,
      groups: this._groups,
      aggregates: this._aggregates,
      masterLink: this._masterLink,
      subject: this._subject
    };
  }

  get fieldDefs() {
    return this._fieldDefs;
  }

  get size() {
    if (this._groups && this._groups.length) {
      const lg = this._groups[this._groups.length - 1];
      return lg.rowIdx + this._getGroupRowCount(lg);
    } else {
      return this._data.size;
    }
  }

  get sortFields() {
    return this._sortFields;
  }

  get currentRow() {
    return this._currentRow;
  }

  get allRowsSelected() {
    return this._allRowsSelected;
  }

  get selectedRows() {
    return this._selectedRows;
  }

  get filter() {
    return this._filter;
  }

  get foundRows() {
    return this._foundRows;
  }

  get foundNodes(): FoundNodes | undefined {
    return !this._foundRows ? undefined : this._foundRows.reduce(
      (c, r) => {
        if (r) {
          r.forEach( n => c.push(n) );
        }
        return c;
      }, []
    );
  }

  get foundNodesCount() {
    return this._foundRows ? this._foundRows.reduce( (c, r) => r ? c + r.length : c, 0 ) : 0;
  }

  get searchStr() {
    return this._searchStr;
  }

  get aggregates() {
    if (this._aggregates) {
      return this._aggregates;
    }

    const aggFields = this._fieldDefs.filter( fd => fd.aggregator );

    if (aggFields.length) {
      const accumulator = aggFields.map( fd => ({
        fieldName: fd.fieldName,
        value: fd.aggregator!.init(),
        processRow: fd.aggregator!.processRow,
        getTotal: fd.aggregator!.getTotal
      }));

      for (let i = 0; i < this._data.size; i++){
        accumulator.forEach(acc => acc.value = acc.processRow(this._getData(this._data, i, this._calcFields), acc.fieldName, acc.value));
      }

      this._aggregates = accumulator.reduce(
        (prev, acc) => {
          prev[acc.fieldName] = acc.getTotal(acc.value);
          return prev;
        }, {} as R
      );
    }

    return this._aggregates;
  }

  get masterLink() {
    return this._masterLink;
  }

  get asObservable() {
    return this._subject;
  }

  private _checkFields(fields: INamedField[]) {
    fields.forEach( f => {
      if (!this._fieldDefs.find( fd => fd.fieldName === f.fieldName )) {
        throw new Error(`Unknown field ${f.fieldName}`);
      }
    });
  }

  private _getGroupRowCount(group: IDataGroup<R>): number {
    const t = group.collapsed ? 0
    : group.subGroups.length ? group.subGroups.reduce( (p, s) => p + this._getGroupRowCount(s), 0 )
    : group.bufferCount;
    return 1 + t + (group.footer && !group.collapsed ? 1 : 0);
  }

  private _findGroup(groups: IDataGroup<R>[], rowIdx: number): { groupIdx: number, group: IDataGroup<R>} {
    const groupsCount = groups.length;

    if (!groupsCount) {
      throw new Error(`Data is not grouped`);
    }

    const fg = groups[0];
    const lg = groups[groupsCount - 1];

    if (rowIdx < fg.rowIdx || rowIdx >= lg.rowIdx + this._getGroupRowCount(lg)) {
      throw new Error(`findGroup: invalid row index ${rowIdx} (${fg.rowIdx}-${lg.rowIdx + this._getGroupRowCount(lg)})`);
    }

    let approxGroupIdx = Math.floor(groupsCount * (rowIdx - fg.rowIdx) / (lg.rowIdx + this._getGroupRowCount(lg) - fg.rowIdx));

    while (approxGroupIdx > 0 && rowIdx < groups[approxGroupIdx].rowIdx) {
      approxGroupIdx--;
    }

    while (approxGroupIdx < groupsCount - 1 && rowIdx >= groups[approxGroupIdx + 1].rowIdx) {
      approxGroupIdx++;
    }

    const group = groups[approxGroupIdx];

    if (rowIdx > group.rowIdx && group.subGroups.length) {
      if (group.footer && !group.collapsed && rowIdx === group.rowIdx + this._getGroupRowCount(group) - 1) {
        return { groupIdx: approxGroupIdx, group };
      } else {
        return this._findGroup(group.subGroups, rowIdx);
      }
    } else {
      return { groupIdx: approxGroupIdx, group };
    }
  }

  private _getData(data: Data<R>, rowIdx: number, calcFields: TRowCalcFunc<R> | undefined): R {
    if (rowIdx < 0 || rowIdx >= data.size) {
      throw new Error(`Invalid row idx ${rowIdx}`);
    }

    if (calcFields) {
      return calcFields(data.get(rowIdx));
    } else {
      return data.get(rowIdx);
    }
  }

  private _get(rowIdx: number, calcFields: TRowCalcFunc<R> | undefined): IRow<R> {
    const groups = this._groups;

    if (!groups || !groups.length) {
      return { data: this._getData(this._data, rowIdx, calcFields), type: TRowType.Data };
    }

    const group = this._findGroup(groups, rowIdx).group;

    if (rowIdx === group.rowIdx) {
      return {
        data: group.header,
        type: group.collapsed ? TRowType.HeaderCollapsed : TRowType.HeaderExpanded,
        group
      };
    }

    if (group.footer && !group.collapsed && rowIdx === group.rowIdx + this._getGroupRowCount(group) - 1) {
      return {
        data: group.footer,
        type: TRowType.Footer,
        group
      };
    }

    return {
      data: this._getData(this._data, group.bufferIdx + rowIdx - group.rowIdx - 1, calcFields),
      type: TRowType.Data,
      group
    };
  }

  public get(rowIdx: number): IRow<R> {
    return this._get(rowIdx, this._calcFields);
  }

  public getValue(rowIdx: number, fieldName: string, defaultValue?: TDataType): TDataType {
    return checkField(this._get(rowIdx, this._calcFields).data, fieldName, defaultValue);
  }

  public getString(rowIdx: number, fieldName: string, defaultValue?: string): string {
    const fd = this.fieldDefs.find( fd => fd.fieldName === fieldName );
    if (fd) {
      switch (fd.dataType) {
        case TFieldType.Float, TFieldType.Integer, TFieldType.Currency:
          return getAsString(this._get(rowIdx, this._calcFields).data, fieldName, defaultValue, fd.numberFormat);
        case TFieldType.Date:
          return getAsString(this._get(rowIdx, this._calcFields).data, fieldName, defaultValue, undefined, fd.dateFormat);
      }
    }
    return getAsString(this._get(rowIdx, this._calcFields).data, fieldName, defaultValue);
  }

  public getNumber(rowIdx: number, fieldName: string, defaultValue?: number): number {
    return getAsNumber(this._get(rowIdx, this._calcFields).data, fieldName, defaultValue);
  }

  public getBoolean(rowIdx: number, fieldName: string, defaultValue?: boolean): boolean {
    return getAsBoolean(this._get(rowIdx, this._calcFields).data, fieldName, defaultValue);
  }

  public getDate(rowIdx: number, fieldName: string, defaultValue?: Date): Date {
    return getAsDate(this._get(rowIdx, this._calcFields).data, fieldName, defaultValue);
  }

  public isNull(rowIdx: number, fieldName: string): boolean {
    return isNull(this._get(rowIdx, this._calcFields).data, fieldName);
  }

  public toArray(): IRow<R>[] {
    const res: IRow<R>[] = [];
    const size = this.size;

    for (let i = 0; i < size; i++) {
      res.push(this.get(i));
    }

    return res;
  }

  public indexOf(row: IRow<R>): number {
    const size = this.size;
    for (let i = 0; i < size; i++) {
      if (this.get(i) === row) {
        return i;
      }
    }
    return -1;
  }

  private _cloneGroups(
    parent: IDataGroup<R> | undefined,
    groups: IDataGroup<R>[],
    cloneGroup: CloneGroup<R>): IDataGroup<R>[]
  {
    const res: IDataGroup<R>[] = [];
    let prev: IDataGroup<R> | undefined = undefined;
    groups.forEach( g => {
      const cloned = cloneGroup(parent, prev, g);
      if (cloned.subGroups.length) {
        cloned.subGroups = this._cloneGroups(cloned, g.subGroups, cloneGroup);
      }
      res.push(cloned);
      prev = cloned;
    });
    return res;
  }

  public toggleGroup(rowIdx: number): RecordSet<R> {
    const groups = this._groups;

    if (!groups || !groups.length) {
      throw new Error(`Data is not grouped`);
    }

    const fg = this._findGroup(groups, rowIdx);

    return new RecordSet<R>(
      {
        ...this.params,
        currentRow: fg.group.rowIdx,
        selectedRows: [],
        groups: this._cloneGroups(undefined, groups,
          (parent, prev, g) => {
            return g.rowIdx < fg.group.rowIdx ? g
            : g.rowIdx === fg.group.rowIdx ? {...g, collapsed: !g.collapsed}
            : {...g, rowIdx: prev ? prev.rowIdx + this._getGroupRowCount(prev) : parent ? parent.rowIdx + 1 : 0}
          }
        )
      }
    );
  }

  public sort(sortFields: SortFields, dimension?: SortFields, measures?: Measures<R>): RecordSet<R> {
    this._checkFields(sortFields);

    if (!this._data.size) {
      return this;
    }

    if (!sortFields.length) {
      return new RecordSet<R>({
        ...this.params,
        sortFields: [],
        searchStr: undefined,
        foundRows: undefined,
        groups: undefined
      });
    }

    const currentRowData = this.get(this._currentRow);
    const selectedRowsData = this._selectedRows.reduce(
      (p, sr, idx) => {
        if (sr) {
          p.push(this.get(idx));
        }
        return p;
      }, [] as IRow<R>[]
    );

    const combinedSort = dimension ? sortFields.concat(dimension) : sortFields;

    const sortOnCalcFields = combinedSort.some( sf => !!this._fieldDefs.find( fd => fd.fieldName === sf.fieldName && !!fd.calcFunc ));

    let fieldDefs = this._fieldDefs;
    let calcFields = this._calcFields;
    let sorted = (sortOnCalcFields ? this._data.sort(
      (a, b) => {
        const calcA = this._calcFields!(a);
        const calcB = this._calcFields!(b);
        return combinedSort.reduce(
          (p, f) => p ? p : (calcA[f.fieldName]! < calcB[f.fieldName]! ? (f.asc ? -1 : 1) : (calcA[f.fieldName]! > calcB[f.fieldName]! ? (f.asc ? 1 : -1) : 0)),
        0);
      }
    )
    :
    this._data.sort(
      (a, b) => combinedSort.reduce(
        (p, f) => p ? p : (a[f.fieldName]! < b[f.fieldName]! ? (f.asc ? -1 : 1) : (a[f.fieldName]! > b[f.fieldName]! ? (f.asc ? 1 : -1) : 0)),
      0)
    )).toList();

    if (dimension && measures) {
      const newFieldDefs: IFieldDef[] = [];
      const newData: R[] = [];

      const calcSlice = (level: number, initialRowIdx: number, size: number, newRow: R, olapValue: TDataType[], upSuffix: string): R => {
        const fieldName = dimension[level].fieldName;
        let rowIdx = initialRowIdx;
        let left = size;

        while (left > 0) {
          let cnt = 0;
          const row = this._getData(sorted, rowIdx + cnt, calcFields);
          const value = row[fieldName];
          const valueFieldDef = this._fieldDefs.find( fd => fd.fieldName === fieldName )!;
          while (cnt < left && this._getData(sorted, rowIdx + cnt, calcFields)[fieldName] === value) {
            cnt++;
          }
          const fieldNameSuffix = `${upSuffix}[${value === null ? 'null' : value.toString()}]`;
          measures.forEach( m => {
            const measureFieldName = `[${m.fieldName}]${fieldNameSuffix}`;
            if (!newFieldDefs.find( fd => fd.fieldName === measureFieldName )) {
              newFieldDefs.push({
                fieldName: measureFieldName,
                dataType: valueFieldDef.dataType,
                caption: value === null ? 'null' : value.toString(),
                olapValue: [...olapValue, value]
              });
            }
            newRow[measureFieldName] = m.measureCalcFunc( idx => this._getData(sorted, idx, calcFields), rowIdx, cnt);
          });
          if (level < dimension.length - 1) {
            calcSlice(level + 1, rowIdx, cnt, newRow, [...olapValue, value], fieldNameSuffix);
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
          while (rowIdx + cnt < sorted.size && this._getData(sorted, rowIdx + cnt, calcFields)[fieldName] === value) {
            if (level < sortFields.length - 1) {
              cnt += groupSlice(level + 1, rowIdx + cnt);
            } else {
              cnt++;
            }
          }
          if (level === sortFields.length - 1) {
            newData.push(calcSlice(0, rowIdx, cnt, sortFields.reduce( (r, sf) => { r[sf.fieldName] = row[sf.fieldName]; return r; }, {} as R ), [], ''));
          }
          if (level) {
            return cnt;
          }
          rowIdx += cnt;
        }

        return sorted.size;
      }

      groupSlice(0, 0);

      sorted = List<R>(newData);
      newFieldDefs.sort(
        (a, b) => {
          if (a.olapValue && b.olapValue) {
            for (let i = 0; i < a.olapValue.length && i < b.olapValue.length; i++) {
              const av = a.olapValue[i];
              const bv = b.olapValue[i];
              const res = av === bv ? 0
                : av === null || av === undefined ? -1
                : bv === null || bv === undefined ? 1
                : av < bv ? -1
                : 1;
              if (res) return res;
            }
            return a.olapValue.length - b.olapValue.length;
          } else {
            return 0;
          }
        }
      );
      fieldDefs = [...sortFields.map( sf => this._fieldDefs.find( fd => fd.fieldName === sf.fieldName )! ), ...newFieldDefs];

      if (calcFields) {
        const withCalcFunc = fieldDefs.filter( fd => fd.calcFunc );

        if (withCalcFunc.length) {
          calcFields = (row: R): R => {
            const res = Object.assign({} as R, row);

            withCalcFunc.forEach(
              fd => res[fd.fieldName] = fd.calcFunc!(res)
            );

            return res;
          }
        } else {
          calcFields = undefined;
        }
      }
    }

    if (sortFields[0].groupBy) {
      const groupData = (level: number, initialRowIdx: number, bufferIdx: number, bufferSize: number) => {
        const res: IDataGroup<R>[] = [];
        const fieldName = sortFields[level].fieldName;
        let rowIdx = initialRowIdx;
        let bufferBeginIdx = bufferIdx;

        while (bufferBeginIdx < bufferIdx + bufferSize) {
          let bufferEndIdx = bufferBeginIdx;
          let value = this._getData(sorted, bufferBeginIdx, calcFields)[fieldName];

          while (bufferEndIdx < bufferIdx + bufferSize && this._getData(sorted, bufferEndIdx, calcFields)[fieldName] === value) {
            bufferEndIdx++;
          }

          const bufferCount = bufferEndIdx - bufferBeginIdx;

          if (bufferCount > 0) {
            const headerData = this._getData(sorted, bufferBeginIdx, calcFields);
            const header: R = {[fieldName]: headerData[fieldName]} as R;
            let footer;

            if (sortFields[level].calcAggregates) {
              const aggFields = this._fieldDefs.filter( fd => fd.aggregator );

              if (aggFields.length) {
                const accumulator = aggFields.map( fd => ({
                  fieldName: fd.fieldName,
                  value: fd.aggregator!.init(),
                  processRow: fd.aggregator!.processRow,
                  getTotal: fd.aggregator!.getTotal,
                }));

                for (let i = bufferBeginIdx; i < bufferBeginIdx + bufferCount; i++) {
                  accumulator.forEach( acc => acc.value = acc.processRow(this._getData(sorted, i, this._calcFields), acc.fieldName, acc.value) );
                }

                footer = accumulator.reduce((prev, acc) => {
                  prev[acc.fieldName] = acc.getTotal(acc.value);
                  return prev;
                }, {} as R);
              };
            }

            const group = {
              header,
              level,
              collapsed: false,
              subGroups: sortFields.length > level + 1 && sortFields[level + 1].groupBy ? groupData(level + 1, rowIdx + 1, bufferBeginIdx, bufferCount) : [],
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

      return new RecordSet<R>({
        ...this.params,
        fieldDefs,
        calcFields,
        data: sorted,
        currentRow: 0,
        sortFields,
        allRowsSelected: false,
        selectedRows: [],
        searchStr: undefined,
        foundRows: undefined,
        groups,
      });
    }

    const res = new RecordSet<R>({
      ...this.params,
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
      res._currentRow = foundIdx;
    }

    res._selectedRows = selectedRowsData.reduce(
      (p, srd) => {
        if (srd) {
          const fi = res.indexOf(srd);
          if (fi >= 0) {
            p[fi] = true;
          }
        }
        return p;
      }, [] as boolean[]
    );

    return res;
  }

  public collapseExpandGroups(collapse: boolean): RecordSet<R> {
    if (!this._groups) {
      throw new Error(`Not in grouping mode`);
    }

    return new RecordSet<R>({
      ...this.params,
      currentRow: 0,
      selectedRows: [],
      searchStr: undefined,
      foundRows: undefined,
      groups: this._cloneGroups(undefined, this._groups,
        (parent, prev, g) => {
          if (prev) {
            return {...g, rowIdx: prev.rowIdx + this._getGroupRowCount(prev), collapsed: collapse};
          }
          else if (parent) {
            return {...g, rowIdx: parent.rowIdx + 1, collapsed: collapse};
          }
          else {
            return {...g, rowIdx: 0, collapsed: collapse};
          }
        }
      ),
    });
  }

  public moveBy(delta: number): RecordSet<R> {
    if (!this.size) {
      return this;
    }

    let newCurrentRow = this._currentRow + delta;
    if (newCurrentRow >= this.size) newCurrentRow = this.size - 1;
    if (newCurrentRow < 0) newCurrentRow = 0;

    return this.setCurrentRow(newCurrentRow);
  }

  public setCurrentRow(currentRow: number): RecordSet<R> {
    if (!this.size || this._currentRow === currentRow) {
      return this;
    }

    if (currentRow < 0 || currentRow >= this.size) {
      throw new Error(`Invalid row index`);
    }

    this._subject.next({ event: 'BeforeScroll', rs: this });

    const rs = new RecordSet<R>({
      ...this.params,
      currentRow,
    });

    this._subject.next({ event: 'AfterScroll', rs });

    return rs;
  }

  public setAllRowsSelected(value: boolean): RecordSet<R> {
    if (value === this.allRowsSelected) {
      return this;
    }

    return new RecordSet<R>({
      ...this.params,
      allRowsSelected: value,
      selectedRows: value ? [] : this._selectedRows
    });
  }

  public selectRow(idx: number, selected: boolean): RecordSet<R> {
    if (idx < 0 || idx >= this.size) {
      throw new Error(`Invalid row index`);
    }

    if (selected && (this.allRowsSelected || this.selectedRows[idx])) {
      return this;
    }

    const selectedRows = this.allRowsSelected ? Array(this.size).fill(true) : [...this._selectedRows];

    const row = this.get(idx);
    selectedRows[idx] = selected || undefined;

    if (row.type === TRowType.HeaderExpanded) {
      selectedRows[idx] = selected || undefined;

      for (let i = 1; i <= row.group!.bufferCount; i++) {
        selectedRows[idx + i] = selectedRows[idx];
      }
    }

    const allRowsSelected = this.size === selectedRows.reduce( (p, sr) => sr ? p + 1 : p, 0 );

    return new RecordSet<R>({
      ...this.params,
      allRowsSelected,
      selectedRows: allRowsSelected ? [] : selectedRows
    });
  }

  public setFilter(filter: IFilter | undefined): RecordSet<R> {
    if (equal(this._filter, filter)) {
      return this;
    }

    const isFilter = filter && filter.conditions.length;
    const currentRowData = this.get(this.currentRow);
    const selectedRowsData = this._allRowsSelected ? this.toArray()
    : this._selectedRows.reduce( (p, sr, idx) =>
      {
        if (sr) {
          p.push(this.get(idx));
        }
        return p;
      }, [] as IRow<R>[]
    );

    let newData: Data<R>;

    if (isFilter) {
      const re = new RegExp(filter!.conditions[0].value, 'i');
      newData = (this._savedData || this._data).filter(
        row => row ? Object.entries(row).some( ([_, value]) => value !== null && re.test(value.toString())) : false
      ).toList();
    } else {
      if (!this._savedData) {
        throw new Error('No saved data for RecordSet');
      }
      newData = this._savedData;
    }

    const res = new RecordSet<R>({
      ...this.params,
      data: newData,
      currentRow: 0,
      sortFields: [],
      allRowsSelected: false,
      selectedRows: [],
      filter: isFilter ? filter : undefined,
      savedData: isFilter ? this._savedData || this._data : undefined,
      searchStr: undefined,
      foundRows: undefined,
      groups: undefined,
      aggregates: undefined
    });

    const foundIdx = this.indexOf(currentRowData);
    if (foundIdx >= 0) {
      res._currentRow = foundIdx;
    }

    res._selectedRows = selectedRowsData.reduce(
      (p, srd) => {
        if (srd) {
          const fi = this.indexOf(srd);
          if (fi >= 0) {
            p[fi] = true;
          }
        }
        return p;
      }, [] as boolean[]
    );

    return res;
  }

  public isFiltered = (): boolean => (
    !!this._filter && !!this._filter.conditions.length && !!this._filter.conditions[0].value
  )

  public search(searchStr: string | undefined): RecordSet<R> {
    if (!searchStr) {
      return new RecordSet<R>({
        ...this.params,
        searchStr: undefined,
        foundRows: undefined
      });
    }

    const re = RegExp(searchStr, 'i');
    const foundRows: FoundRows = [];
    let foundIdx = 1;

    for(let rowIdx = 0; rowIdx < this.size; rowIdx++) {
      const v = this.get(rowIdx).data;
          const foundNodes: FoundNodes = [];
          Object.entries(v).forEach( ([fieldName, fieldValue]) => {
            if (!fieldValue) return;

            const s = fieldValue.toString();
            let b = 0;
            let m = re.exec(s);

            while(m !== null) {
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

    return new RecordSet<R>({
      ...this.params,
      searchStr,
      foundRows: foundRows.length ? foundRows : undefined
    });
  }

  public splitMatched(row: number, fieldName: string): IMatchedSubString[] {

    if (row < 0 || row >= this.size) {
      throw new Error(`splitMatched: invalid row index ${row}`);
    }

    const rowData = this.get(row).data;
    const s = rowData[fieldName] ? rowData[fieldName]!.toString() : '';

    if (this._foundRows && this._foundRows[row]) {
      const foundNodes = this._foundRows[row].filter( fn => fn.fieldName === fieldName );

      if (foundNodes.length) {
        const res: IMatchedSubString[] = [];
        let b = 0;
        foundNodes.forEach(
          fn => {
            if (b < fn.matchStart) {
              res.push({
                str: s.substr(b, fn.matchStart - b),
              });
            }
            res.push({
              str: s.substr(fn.matchStart, fn.matchLen),
              foundIdx: fn.foundIdx
            });
            b = fn.matchStart + fn.matchLen;
          }
        );
        if (b < s.length) {
          res.push({
            str: s.substr(b),
          });
        }
        return res;
      }
    }

    if (this.isFiltered()) {
      const re = new RegExp(this._filter!.conditions[0].value, 'i');
      const res: IMatchedSubString[] = [];
      let l = 0;
      let m = re.exec(s);

      while(m !== null) {
        if (m.index) {
          res.push({ str: m.input.substr(0, m.index) });
          l = l + m.index;
        }
        res.push({ str: m.input.substr(m.index, m[0].length), matchFilter: true });
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

  public setData(data: Data<R>, masterLink?: IMasterLink): RecordSet<R> {
    const rs = new RecordSet<R>({
      ...this.params,
      data,
      currentRow: 0,
      sortFields: [],
      allRowsSelected: false,
      selectedRows: [],
      filter: undefined,
      savedData: undefined,
      searchStr: undefined,
      foundRows: undefined,
      groups: undefined,
      aggregates: undefined
    });

    this._subject.next({ event: 'AfterScroll', rs });

    return rs;
  }
};

