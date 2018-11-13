import { List } from "immutable";
import { IDataRow, FieldDefs, SortFields, INamedField, IMatchedSubString, FoundRows, FoundNodes, IDataGroup, TRowType, IRow, TRowCalcFunc, CloneGroup } from "./types";
import { IFilter } from "./filter";
import equal from "fast-deep-equal";

export type Data<R extends IDataRow = IDataRow> = List<R>;

export type FilterFunc<R extends IDataRow = IDataRow> = (row: R, idx: number) => boolean;

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

  private constructor (
    name: string,
    fieldDefs: FieldDefs,
    calcFields: TRowCalcFunc<R> | undefined,
    data: Data<R>,
    currentRow: number = 0,
    sortFields: SortFields = [],
    allRowsSelected: boolean = false,
    selectedRows: boolean[] = [],
    filter?: IFilter,
    savedData?: Data<R>,
    searchStr?: string,
    foundRows?: FoundRows,
    groups?: IDataGroup<R>[])
  {
    if (!data.size && (currentRow >= 0)) {
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

    if (this.size && currentRow >= this.size) {
      throw new Error('Invalid currentRow value');
    }
  }

  public static createWithData<R extends IDataRow = IDataRow>(
    name: string,
    fieldDefs: FieldDefs,
    data: Data<R>): RecordSet<R>
  {
    const withCalcFunc = fieldDefs.filter( fd => fd.calcFunc );

    if (withCalcFunc.length) {
      return new RecordSet<R>(
        name,
        fieldDefs,
        (row: R): R => {
          const res = Object.assign({} as R, row);

          withCalcFunc.forEach(
            fd => res[fd.fieldName] = fd.calcFunc!(res)
          );

          return res;
        },
        data
      );
    } else {
      return new RecordSet<R>(name, fieldDefs, undefined, data);
    }
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
    return 1 + t + (group.footer ? 1 : 0);
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
      return this._findGroup(group.subGroups, rowIdx);
    } else {
      return { groupIdx: approxGroupIdx, group };
    }
  }

  private _getData(data: List<R>, rowIdx: number): R {
    if (this._calcFields) {
      return this._calcFields(data.get(rowIdx));
    } else {
      return data.get(rowIdx);
    }
  }

  private _get(data: List<R>, rowIdx: number): IRow<R> {
    const groups = this._groups;

    if (!groups || !groups.length) {
      return { data: this._getData(data, rowIdx), type: TRowType.Data };
    }

    const group = this._findGroup(groups, rowIdx).group;

    if (rowIdx === group.rowIdx) {
      return {
        data: group.header,
        type: group.collapsed ? TRowType.HeaderCollapsed : TRowType.HeaderExpanded,
        group
      };
    }

    if (group.footer && rowIdx === group.rowIdx + this._getGroupRowCount(group) - 1) {
      return {
        data: group.footer,
        type: TRowType.Footer,
        group
      };
    }

    return {
      data: this._getData(data, group.bufferIdx + rowIdx - group.rowIdx - 1),
      type: TRowType.Data,
      group
    };
  }

  public get(rowIdx: number): IRow<R> {
    return this._get(this._data, rowIdx);
  }

  public getString(rowIdx: number, fieldName: string): string {
    const f = this.get(rowIdx).data[fieldName];
    return f ? f.toString() : '';
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
      this.name,
      this._fieldDefs,
      this._calcFields,
      this._data,
      fg.group.rowIdx,
      this._sortFields,
      this._allRowsSelected,
      [],
      this._filter,
      this._savedData,
      this._searchStr,
      this._foundRows,
      this._cloneGroups(undefined, groups,
        (parent, prev, g) => {
          return g.rowIdx < fg.group.rowIdx ? g
          : g.rowIdx === fg.group.rowIdx ? {...g, collapsed: !g.collapsed}
          : {...g, rowIdx: prev ? prev.rowIdx + this._getGroupRowCount(prev) : parent ? parent.rowIdx + 1 : 0}
        }
      )
    );
  }

  public sort(sortFields: SortFields): RecordSet<R> {
    this._checkFields(sortFields);

    if (!this._data.size) {
      return this;
    }

    if (!sortFields.length) {
      return new RecordSet<R>(
        this.name,
        this._fieldDefs,
        this._calcFields,
        this._data,
        this._currentRow,
        [],
        this._allRowsSelected,
        this._selectedRows,
        this._filter,
        this._savedData
      );
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

    const sortOnCalcFields = sortFields.some( sf => !!this._fieldDefs.find( fd => fd.fieldName === sf.fieldName && !!fd.calcFunc ));

    const sorted = (sortOnCalcFields ? this._data.sort(
      (a, b) => {
        const calcA = this._calcFields!(a);
        const calcB = this._calcFields!(b);
        return sortFields.reduce(
          (p, f) => p ? p : (calcA[f.fieldName]! < calcB[f.fieldName]! ? (f.asc ? -1 : 1) : (calcA[f.fieldName]! > calcB[f.fieldName]! ? (f.asc ? 1 : -1) : 0)),
        0);
      }
    )
    :
    this._data.sort(
      (a, b) => sortFields.reduce(
        (p, f) => p ? p : (a[f.fieldName]! < b[f.fieldName]! ? (f.asc ? -1 : 1) : (a[f.fieldName]! > b[f.fieldName]! ? (f.asc ? 1 : -1) : 0)),
      0)
    )).toList();

    if (sortFields[0].groupBy) {
      const groupData = (level: number, initialRowIdx: number, bufferIdx: number, bufferSize: number) => {
        const res: IDataGroup<R>[] = [];
        const fieldName = sortFields[level].fieldName;
        let rowIdx = initialRowIdx;
        let bufferBeginIdx = bufferIdx;

        while (bufferBeginIdx < bufferIdx + bufferSize) {
          let bufferEndIdx = bufferBeginIdx;
          let value = this._getData(sorted, bufferBeginIdx)[fieldName];

          while (bufferEndIdx < bufferIdx + bufferSize && this._getData(sorted, bufferEndIdx)[fieldName] === value) {
            bufferEndIdx++;
          }

          const bufferCount = bufferEndIdx - bufferBeginIdx;

          if (bufferCount > 0) {
            const headerData = this._getData(sorted, bufferBeginIdx);
            const header: R = {[fieldName]: headerData[fieldName]} as R;
            const group = {
              header,
              level,
              collapsed: false,
              subGroups: sortFields.length > level + 1 && sortFields[level + 1].groupBy ? groupData(level + 1, rowIdx + 1, bufferBeginIdx, bufferCount) : [],
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

      return new RecordSet<R>(
        this.name,
        this._fieldDefs,
        this._calcFields,
        sorted,
        0,
        sortFields,
        false,
        [],
        this._filter,
        this._savedData,
        undefined,
        undefined,
        groups
      );
    }

    const res = new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._calcFields,
      sorted,
      0,
      sortFields,
      this._allRowsSelected,
      [],
      this._filter,
      this._savedData
    );

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

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._calcFields,
      this._data,
      0,
      this._sortFields,
      this._allRowsSelected,
      [],
      this._filter,
      this._savedData,
      undefined,
      undefined,
      this._cloneGroups(undefined, this._groups,
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
      )
    );
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

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._calcFields,
      this._data,
      currentRow,
      this._sortFields,
      this._allRowsSelected,
      this._selectedRows,
      this._filter,
      this._savedData,
      this._searchStr,
      this._foundRows,
      this._groups
    );
  }

  public setAllRowsSelected(value: boolean): RecordSet<R> {
    if (value === this.allRowsSelected) {
      return this;
    }

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._calcFields,
      this._data,
      this._currentRow,
      this._sortFields,
      value,
      value ? [] : this._selectedRows,
      this._filter,
      this._savedData,
      this._searchStr,
      this._foundRows,
      this._groups
    );
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

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._calcFields,
      this._data,
      this._currentRow,
      this._sortFields,
      allRowsSelected,
      allRowsSelected ? [] : selectedRows,
      this._filter,
      this._savedData,
      this._searchStr,
      this._foundRows,
      this._groups
    );
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

    const res = new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._calcFields,
      newData,
      0,
      [],
      false,
      [],
      isFilter ? filter : undefined,
      isFilter ? this._savedData || this._data : undefined
    );

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
      return new RecordSet<R>(
        this.name,
        this._fieldDefs,
        this._calcFields,
        this._data,
        this._currentRow,
        this._sortFields,
        this._allRowsSelected,
        this._selectedRows,
        this._filter,
        this._savedData,
        undefined,
        undefined,
        this._groups
      );
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

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._calcFields,
      this._data,
      this._currentRow,
      this._sortFields,
      this._allRowsSelected,
      this._selectedRows,
      this._filter,
      this._savedData,
      searchStr,
      foundRows.length ? foundRows : undefined,
      this._groups
    );
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
};

