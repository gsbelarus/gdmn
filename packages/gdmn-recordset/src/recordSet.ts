import { List } from "immutable";
import { IDataRow, FieldDefs, SortFields, INamedField, IMatchedSubString, IFoundNode, FoundRows, FoundNodes, IDataGroup, TRowType, TFieldType, TDataType, IRow } from "./types";
import { IFilter } from "./filter";
import equal from "fast-deep-equal";

export type Data<R extends IDataRow = IDataRow> = List<R>;

export type FilterFunc<R extends IDataRow = IDataRow> = (row: R, idx: number) => boolean;

export class RecordSet<R extends IDataRow = IDataRow> {
  readonly name: string;
  private _fieldDefs: FieldDefs;
  private _data: Data<R>;
  private _currentRow: number;
  private _sortFields: SortFields;
  private _allRowsSelected: boolean;
  private _selectedRows: boolean[];
  private _filter: IFilter | undefined;
  private _savedData: Data<R> | undefined;
  private _foundRows: FoundRows | undefined;
  private _groups?: IDataGroup<R>[];

  constructor (
    name: string,
    fieldDefs: FieldDefs,
    data: Data<R>,
    currentRow: number = 0,
    sortFields: SortFields = [],
    allRowsSelected: boolean = false,
    selectedRows: boolean[] = [],
    filter?: IFilter,
    savedData?: Data<R>,
    foundRows?: FoundRows,
    groups?: IDataGroup<R>[])
  {
    if (!data.size && (currentRow >= 0)) {
      throw new Error(`For an empty record set currentRow must be 0`);
    }

    if (data.size && currentRow >= data.size) {
      throw new Error('Invalid currentRow value');
    }

    this.name = name;
    this._fieldDefs = fieldDefs;
    this._data = data;
    this._currentRow = currentRow < 0 ? 0 : currentRow;
    this._sortFields = sortFields;
    this._allRowsSelected = allRowsSelected;
    this._selectedRows = selectedRows;
    this._filter = filter;
    this._savedData = savedData;
    this._foundRows = foundRows;
    this._groups = groups;
  }

  get fieldDefs() {
    return this._fieldDefs;
  }

  get size() {
    if (this._groups && this._groups.length) {
      const lg = this._groups[this._groups.length - 1];
      return lg.rowIdx + 1 + (lg.collapsed ? 0 : lg.rowCount) + (lg.footer ? 1 : 0);
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

  private checkFields(fields: INamedField[]) {
    fields.forEach( f => {
      if (!this._fieldDefs.find( fd => fd.fieldName === f.fieldName )) {
        throw new Error(`Unknown field ${f.fieldName}`);
      }
    });
  }

  private findGroup(rowIdx: number): { groupIdx: number, group: IDataGroup<R>} {
    const groups = this._groups;

    if (!groups || !groups.length) {
      throw new Error(`Data is not grouped`);
    }

    const groupsCount = groups.length;
    const lastGroup = groups[groupsCount - 1];

    if (rowIdx < 0 || rowIdx >= lastGroup.rowIdx + lastGroup.rowCount + 2) {
      throw new Error(`Invalid row index ${rowIdx}`);
    }

    let approxGroupIdx = Math.floor(groupsCount * rowIdx / (lastGroup.rowIdx + (lastGroup.collapsed ? 0 : lastGroup.rowCount) + 2));

    while (approxGroupIdx > 0 && rowIdx < groups[approxGroupIdx].rowIdx) {
      approxGroupIdx--;
    }

    while (approxGroupIdx < groupsCount - 1 && rowIdx >= groups[approxGroupIdx + 1].rowIdx) {
      approxGroupIdx++;
    }

    return { groupIdx: approxGroupIdx, group: groups[approxGroupIdx] };
  }

  public get(rowIdx: number): IRow<R> {
    const groups = this._groups;

    if (!groups || !groups.length) {
      return { data: this._data.get(rowIdx), type: TRowType.Data };
    }

    const group = this.findGroup(rowIdx).group;

    if (rowIdx === group.rowIdx) {
      return {
        data: group.header,
        type: group.collapsed ? TRowType.HeaderCollapsed : TRowType.HeaderExpanded
      };
    }

    if (rowIdx <= group.rowIdx + group.rowCount ) {
      return {
        data: this._data.get(group.bufferIdx + rowIdx - group.rowIdx - 1),
        type: TRowType.Data
      };
    }

    if (group.footer) {
      return {
        data: group.footer,
        type: group.collapsed ? TRowType.HeaderCollapsed : TRowType.Footer
      };
    }

    throw new Error(`Invalid row index ${rowIdx}`);
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

  public toggleGroup(rowIdx: number): RecordSet<R> {
    const groups = this._groups;

    if (!groups || !groups.length) {
      throw new Error(`Data is not grouped`);
    }

    const fg = this.findGroup(rowIdx);
    const newGroups = [...groups];

    for (let i = fg.groupIdx + 1; i < groups.length; i++) {
      newGroups[i] = {
        ...groups[i],
        rowIdx: groups[i].rowIdx + (fg.group.collapsed ? fg.group.rowCount : -fg.group.rowCount)
      };
    }

    newGroups[fg.groupIdx] = {
      ...fg.group,
      collapsed: !fg.group.collapsed
    };

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._data,
      this._currentRow,
      this._sortFields,
      this._allRowsSelected,
      this._selectedRows,
      this._filter,
      this._savedData,
      this._foundRows,
      newGroups
    );
  }

  public sort(sortFields: SortFields): RecordSet<R> {
    this.checkFields(sortFields);

    if (!this._data.size) {
      return this;
    }

    if (!sortFields.length) {
      return new RecordSet<R>(
        this.name,
        this._fieldDefs,
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

    const sorted = this._data.sort(
      (a, b) => sortFields.reduce(
        (p, f) => p ? p : (a[f.fieldName]! < b[f.fieldName]! ? (f.asc ? -1 : 1) : (a[f.fieldName]! > b[f.fieldName]! ? (f.asc ? 1 : -1) : 0)),
      0)
    ).toList();

    if (sortFields[0].groupBy) {
      const groupData = (fieldName: string, level: number, initialRowIdx: number, bufferIdx: number) => {
        const res: IDataGroup<R>[] = [];
        let rowIdx = initialRowIdx;
        let bufferBeginIdx = bufferIdx;

        while (bufferBeginIdx < sorted.size) {
          let bufferEndIdx = bufferBeginIdx;
          let value = sorted.get(bufferBeginIdx)[fieldName];

          while (bufferEndIdx < sorted.size && sorted.get(bufferEndIdx)[fieldName] === value) {
            bufferEndIdx++;
          }

          const rowCount = bufferEndIdx - bufferBeginIdx - 1;

          if (rowCount > 0) {
            res.push(
              {
                header: sorted.get(bufferBeginIdx),
                level,
                collapsed: false,
                subGroups: [],
                rowIdx: rowIdx,
                bufferIdx: bufferBeginIdx,
                rowCount
              }
            );
            rowIdx += rowCount + 1;
          }

          bufferBeginIdx = bufferEndIdx;
        }

        return res;
      };

      const fieldName = sortFields[0].fieldName;
      const groups = groupData(fieldName, 0, 0, 0);

      return new RecordSet<R>(
        this.name,
        this._fieldDefs,
        sorted,
        0,
        sortFields,
        false,
        [],
        this._filter,
        this._savedData,
        undefined,
        groups
      );
    }

    const res = new RecordSet<R>(
      this.name,
      this._fieldDefs,
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
      this._data,
      currentRow,
      this._sortFields,
      this._allRowsSelected,
      this._selectedRows,
      this._filter,
      this._savedData,
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
      this._data,
      this._currentRow,
      this._sortFields,
      value,
      value ? [] : this._selectedRows,
      this._filter,
      this._savedData,
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

    selectedRows[idx] = selected || undefined;
    const allRowsSelected = this.size === selectedRows.reduce( (p, sr) => sr ? p + 1 : p, 0 );

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._data,
      this._currentRow,
      this._sortFields,
      allRowsSelected,
      allRowsSelected ? [] : selectedRows,
      this._filter,
      this._savedData,
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

  public search(re: RegExp | undefined): RecordSet<R> {
    if (!re) {
      return new RecordSet<R>(
        this.name,
        this._fieldDefs,
        this._data,
        this._currentRow,
        this._sortFields,
        this._allRowsSelected,
        this._selectedRows,
        this._filter,
        this._savedData,
        undefined,
        this._groups
      );
    }

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
              b = m.index + m[0].length;
              m = re.exec(m.input.substr(b));
            }
          });
          if (foundNodes.length) {
            foundRows[rowIdx] = foundNodes;
          }
        }

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      this._data,
      this._currentRow,
      this._sortFields,
      this._allRowsSelected,
      this._selectedRows,
      this._filter,
      this._savedData,
      foundRows.length ? foundRows : undefined,
      this._groups
    );
  }

  public splitMatched(row: number, fieldName: string): IMatchedSubString[] {

    if (row < 0 || row >= this.size) {
      throw new Error(`Invalid row index ${row}`);
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

