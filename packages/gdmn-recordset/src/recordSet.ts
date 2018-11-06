import { List } from "immutable";
import { IDataRow, FieldDefs, SortFields, INamedField, IMatchedSubString, IFoundNode, FoundRows, FoundNodes } from "./types";
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

  constructor (
    name: string,
    fieldDefs: FieldDefs,
    data: Data<R>,
    currentRow: number = 0,
    sortFields: SortFields = [],
    allRowsSelected: boolean = false,
    selectedRows: boolean[] = [],
    filter: IFilter | undefined = undefined,
    savedData: Data<R> | undefined = undefined,
    foundRows: FoundRows | undefined = undefined)
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
  }

  get fieldDefs() {
    return this._fieldDefs;
  }

  get data() {
    return this._data;
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

  public sort(sortFields: SortFields): RecordSet<R> {
    this.checkFields(sortFields);

    if (!this._data.size) {
      return this;
    }

    const currentRowData = this._data.get(this._currentRow);
    const selectedRowsData = this._selectedRows.reduce( (p, sr, idx) => { if (sr) { p.push(this._data.get(idx)); } return p; }, [] as R[] );
    const sorted = this._data.sort(
      (a, b) => sortFields.reduce(
        (p, f) => p ? p : (a[f.fieldName]! < b[f.fieldName]! ? (f.asc ? -1 : 1) : (a[f.fieldName]! > b[f.fieldName]! ? (f.asc ? 1 : -1) : 0)),
      0)
    ).toList();

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      sorted,
      sorted.findIndex( v => v === currentRowData ),
      sortFields,
      this._allRowsSelected,
      selectedRowsData.reduce(
        (p, srd) => {
          if (srd) {
            p[sorted.findIndex( v => v === srd )] = true;
          }
          return p;
        }, [] as boolean[]
      ),
      this._filter,
      this._savedData
    );
  }

  public moveBy(delta: number): RecordSet<R> {
    if (!this._data.size) {
      return this;
    }

    let newCurrentRow = this._currentRow + delta;
    if (newCurrentRow >= this._data.size) newCurrentRow = this._data.size - 1;
    if (newCurrentRow < 0) newCurrentRow = 0;

    return this.setCurrentRow(newCurrentRow);
  }

  public setCurrentRow(currentRow: number): RecordSet<R> {
    if (!this._data.size || this._currentRow === currentRow) {
      return this;
    }

    if (currentRow < 0 || currentRow >= this._data.size) {
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
      this._foundRows
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
      this._foundRows
    );
  }

  public selectRow(idx: number, selected: boolean) {
    if (idx < 0 || idx >= this._data.size) {
      throw new Error(`Invalid row index`);
    }

    if (selected && (this.allRowsSelected || this.selectedRows[idx])) {
      return this;
    }

    const selectedRows = this.allRowsSelected ? Array(this._data.size).fill(true) : [...this._selectedRows];

    selectedRows[idx] = selected || undefined;
    const allRowsSelected = this._data.size === selectedRows.reduce( (p, sr) => sr ? p + 1 : p, 0 );

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
      this._foundRows
    );
  }

  public setFilter(filter: IFilter | undefined): RecordSet<R> {
    if (equal(this._filter, filter)) {
      return this;
    }

    const isFilter = filter && filter.conditions.length;
    const currentRowData = this._data.get(this._currentRow);
    const selectedRowsData = this._allRowsSelected ? this._data.toArray()
    : this._selectedRows.reduce( (p, sr, idx) =>
      {
        if (sr) { p.push(this._data.get(idx)); }
        return p;
      }, [] as R[]);

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

    return new RecordSet<R>(
      this.name,
      this._fieldDefs,
      newData,
      newData.findIndex( v => v === currentRowData ),
      [],
      false,
      selectedRowsData.reduce(
        (p, srd) => {
          if (srd) {
            const newIndex = newData.findIndex( v => v === srd );
            if (newIndex >= 0) {
              p[newIndex] = true;
            }
          }
          return p;
        }, [] as boolean[]
      ),
      isFilter ? filter : undefined,
      isFilter ? this._savedData || this._data : undefined,
    );
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
        this._savedData
      );
    }

    const foundRows: FoundRows = [];
    let foundIdx = 1;

    this._data.forEach(
      (v, rowIdx) => {
        if (v && typeof rowIdx === 'number') {
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
      }
    );

    /*
    let nearestRow = this._currentRow;
    let minDistance = this._data.size;

    foundNodes.forEach( fn => {
      const distance = Math.abs(fn.rowIdx - this._currentRow);
      if (distance < minDistance) {
        minDistance = distance;
        nearestRow = fn.rowIdx;
      }
    });
    */

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
      foundRows.length ? foundRows : undefined
    );
  }

  public splitMatched(row: number, fieldName: string): IMatchedSubString[] {

    if (row < 0 || row >= this._data.size) {
      throw new Error(`Invalid row index ${row}`);
    }

    const rowData = this._data.get(row);
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

