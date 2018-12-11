import React from 'react';
import { View } from './View';
import { RecordSet, SortFields } from 'gdmn-recordset';
import { GridComponentState, GDMNGrid } from 'gdmn-grid';

export interface IRSAndGCS {
  rs: RecordSet,
  gcs: GridComponentState
};

export interface IDataViewProps {
  data: IRSAndGCS[],
  loadData: () => void,
  onCancelSortDialog: (gridName: string) => void,
  onApplySortDialog: (rs: RecordSet, gridName: string, sortFields: SortFields, gridRef?: GDMNGrid) => void,
  onColumnResize: (gridName: string, columnIndex: number, newWidth: number) => void,
  onColumnMove: (gridName: string, oldIndex: number, newIndex: number) => void,
  onSelectRow: (rs: RecordSet, idx: number, selected: boolean) => void,
  onSelectAllRows: (rs: RecordSet, value: boolean) => void,
  onSetCursorPos: (rs: RecordSet, gridName: string, cursorCol: number, cursorRow: number) => void,
  onSort: (rs: RecordSet, sortFields: SortFields, gridRef?: GDMNGrid) => void,
  onToggleGroup: (rs: RecordSet, rowIdx: number) => void
};

export class DataView<P extends IDataViewProps, S> extends View<P, S> {
  private _refMasterGrid: GDMNGrid | undefined;
  private _refDetailGrid: GDMNGrid | undefined;

  private isDataLoaded() {
    const { data } = this.props;
    return data.length && data[0].rs;
  }

  public componentDidMount() {
    const { loadData } = this.props;
    if (!this.isDataLoaded()) {
      loadData();
    }
  }

  public componentDidUpdate() {
    const { loadData } = this.props;
    if (!this.isDataLoaded()) {
      loadData();
    }
  }

  public render() {
    if (!this.isDataLoaded()) {
      return this.renderLoading();
    }

    const { data, onCancelSortDialog, onApplySortDialog, onColumnResize,
      onColumnMove, onSelectRow, onSelectAllRows, onSetCursorPos, onSort, onToggleGroup } = this.props;
    const masterGridName = data[0].rs.name;
    const detailGridName = data[1].rs.name;

    return this.renderWide(
      <div className="ViewGridPlacement">
        <GDMNGrid {...data[0].gcs} rs={data[0].rs}
          onCancelSortDialog={ () => onCancelSortDialog(masterGridName) }
          onApplySortDialog={ (sortFields: SortFields) => onApplySortDialog(data[0].rs, masterGridName, sortFields, this._refMasterGrid) }
          onColumnResize={ (columnIndex: number, newWidth: number) => onColumnResize(masterGridName, columnIndex, newWidth) }
          onColumnMove={ (oldIndex: number, newIndex: number) => onColumnMove(masterGridName, oldIndex, newIndex) }
          onSelectRow={ (idx: number, selected: boolean) => onSelectRow(data[0].rs, idx, selected) }
          onSelectAllRows={ (value: boolean) => onSelectAllRows(data[0].rs, value) }
          onSetCursorPos={ (cursorCol: number, cursorRow: number) => onSetCursorPos(data[0].rs, masterGridName, cursorCol, cursorRow) }
          onSort={ (rs: RecordSet, sortFields: SortFields) => onSort(rs, sortFields, this._refMasterGrid) }
          onToggleGroup={ (rowIdx: number) => onToggleGroup(data[0].rs, rowIdx) }
          ref={ (grid: GDMNGrid) => grid && (this._refMasterGrid = grid) }
        />
        <GDMNGrid {...data[1].gcs} rs={data[1].rs}
          onCancelSortDialog={ () => onCancelSortDialog(detailGridName) }
          onApplySortDialog={ (sortFields: SortFields) => onApplySortDialog(data[1].rs, detailGridName, sortFields, this._refDetailGrid) }
          onColumnResize={ (columnIndex: number, newWidth: number) => onColumnResize(detailGridName, columnIndex, newWidth) }
          onColumnMove={ (oldIndex: number, newIndex: number) => onColumnMove(detailGridName, oldIndex, newIndex) }
          onSelectRow={ (idx: number, selected: boolean) => onSelectRow(data[1].rs, idx, selected) }
          onSelectAllRows={ (value: boolean) => onSelectAllRows(data[1].rs, value) }
          onSetCursorPos={ (cursorCol: number, cursorRow: number) => onSetCursorPos(data[1].rs, detailGridName, cursorCol, cursorRow) }
          onSort={ (rs: RecordSet, sortFields: SortFields) => onSort(rs, sortFields, this._refDetailGrid) }
          onToggleGroup={ (rowIdx: number) => onToggleGroup(data[1].rs, rowIdx) }
          ref={ (grid: GDMNGrid) => grid && (this._refDetailGrid = grid) }
        />
      </div>
    );
  }
}

/*

      <>
        {entitiesRs && attributesRs && <DefaultButton text="Load grid..." onClick={ () =>
          {
            this.setState({
              entitiesGrid: connectGrid('entities', entitiesRs, undefined, () => {
                const res = this._refEntitiesGrid;

                if (!res) {
                  throw new Error(`Grid ref is not set`);
                }

                return res;
              }),
              attributesGrid: connectGrid('attributes', attributesRs, undefined, () => {
                const res = this._refAttributesGrid;

                if (!res) {
                  throw new Error(`Grid ref is not set`);
                }

                return res;
              })
            });
          }}
        />}
        {EntitiesGrid && AttributesGrid &&
          <div className="ViewGridPlacement">
            <EntitiesGrid ref={ (grid: any) => grid && (this._refEntitiesGrid = grid.getWrappedInstance()) } rs={entitiesRs!} />
            <AttributesGrid ref={ (grid: any) => grid && (this._refAttributesGrid = grid.getWrappedInstance()) } rs={attributesRs!} />
          </div>
        }
      </>

    */
