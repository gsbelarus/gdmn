import React from 'react';
import { View, IViewProps } from './View';
import { RecordSet, SortFields } from 'gdmn-recordset';
import { GDMNGrid, GridComponentState } from 'gdmn-grid';

export interface IRSAndGCS {
  rs: RecordSet;
  gcs: GridComponentState;
  detail?: IRSAndGCS[];
}

export interface IDataViewProps<R> extends IViewProps<R> {
  data?: IRSAndGCS;
  loadData: () => void;
  onCancelSortDialog: (gridName: string) => void;
  onApplySortDialog: (rs: RecordSet, gridName: string, sortFields: SortFields, gridRef?: GDMNGrid) => void;
  onColumnResize: (gridName: string, columnIndex: number, newWidth: number) => void;
  onColumnMove: (gridName: string, oldIndex: number, newIndex: number) => void;
  onSelectRow: (rs: RecordSet, idx: number, selected: boolean) => void;
  onSelectAllRows: (rs: RecordSet, value: boolean) => void;
  onSetCursorPos: (rs: RecordSet, gridName: string, cursorCol: number, cursorRow: number) => void;
  onSort: (rs: RecordSet, sortFields: SortFields, gridRef?: GDMNGrid) => void;
  onToggleGroup: (rs: RecordSet, rowIdx: number) => void;
}

export interface IGridRef {
  [name: string]: GDMNGrid | undefined;
}

export class DataView<P extends IDataViewProps<R>, S, R = any> extends View<P, S, R> {
  private _gridRef: IGridRef = {};

  public isDataLoaded(): boolean {
    const { data } = this.props;
    return !!(data && data.rs);
  }

  public componentDidUpdate() {
    const { data, loadData } = this.props;

    if (!data || !data.rs) {
      loadData();
      return false;
    } else {
      if (data.detail && data.detail.length) {

      }
    }

    return true;
  }

  public renderMD() {
    const {
      data,
      onCancelSortDialog,
      onApplySortDialog,
      onColumnResize,
      onColumnMove,
      onSelectRow,
      onSelectAllRows,
      onSetCursorPos,
      onSort,
      onToggleGroup
    } = this.props;
    const masterRS = data!.rs;
    const detailRS = data!.detail![0].rs;
    const masterGridName = masterRS.name;
    const detailGridName = detailRS.name;

    return this.renderWide(
      <div className="ViewGridPlacement">
        <GDMNGrid
          {...data!.gcs}
          rs={masterRS}
          onCancelSortDialog={() => onCancelSortDialog(masterGridName)}
          onApplySortDialog={(sortFields: SortFields) =>
            onApplySortDialog(masterRS, masterGridName, sortFields, this._gridRef[masterGridName])
          }
          onColumnResize={(columnIndex: number, newWidth: number) =>
            onColumnResize(masterGridName, columnIndex, newWidth)
          }
          onColumnMove={(oldIndex: number, newIndex: number) => onColumnMove(masterGridName, oldIndex, newIndex)}
          onSelectRow={(idx: number, selected: boolean) => onSelectRow(masterRS, idx, selected)}
          onSelectAllRows={(value: boolean) => onSelectAllRows(masterRS, value)}
          onSetCursorPos={(cursorCol: number, cursorRow: number) =>
            onSetCursorPos(masterRS, masterGridName, cursorCol, cursorRow)
          }
          onSort={(rs: RecordSet, sortFields: SortFields) => onSort(rs, sortFields, this._gridRef[masterGridName])}
          onToggleGroup={(rowIdx: number) => onToggleGroup(masterRS, rowIdx)}
          ref={(grid: GDMNGrid) => grid && (this._gridRef[masterGridName] = grid)}
        />
        <GDMNGrid
          {...data!.detail![0].gcs}
          rs={detailRS}
          onCancelSortDialog={() => onCancelSortDialog(detailGridName)}
          onApplySortDialog={(sortFields: SortFields) =>
            onApplySortDialog(detailRS, detailGridName, sortFields, this._gridRef[detailGridName])
          }
          onColumnResize={(columnIndex: number, newWidth: number) =>
            onColumnResize(detailGridName, columnIndex, newWidth)
          }
          onColumnMove={(oldIndex: number, newIndex: number) => onColumnMove(detailGridName, oldIndex, newIndex)}
          onSelectRow={(idx: number, selected: boolean) => onSelectRow(detailRS, idx, selected)}
          onSelectAllRows={(value: boolean) => onSelectAllRows(detailRS, value)}
          onSetCursorPos={(cursorCol: number, cursorRow: number) =>
            onSetCursorPos(detailRS, detailGridName, cursorCol, cursorRow)
          }
          onSort={(rs: RecordSet, sortFields: SortFields) => onSort(rs, sortFields, this._gridRef[detailGridName])}
          onToggleGroup={(rowIdx: number) => onToggleGroup(detailRS, rowIdx)}
          ref={(grid: GDMNGrid) => grid && (this._gridRef[detailGridName] = grid)}
        />
      </div>
    );
  }

  public renderS() {
    const {
      data,
      onCancelSortDialog,
      onApplySortDialog,
      onColumnResize,
      onColumnMove,
      onSelectRow,
      onSelectAllRows,
      onSetCursorPos,
      onSort,
      onToggleGroup
    } = this.props;
    const masterRS = data!.rs;
    const masterGridName = masterRS.name;

    return this.renderWide(
      <div className="ViewGridPlacement">
        <GDMNGrid
          {...data!.gcs}
          rs={masterRS}
          onCancelSortDialog={() => onCancelSortDialog(masterGridName)}
          onApplySortDialog={(sortFields: SortFields) =>
            onApplySortDialog(masterRS, masterGridName, sortFields, this._gridRef[masterGridName])
          }
          onColumnResize={(columnIndex: number, newWidth: number) =>
            onColumnResize(masterGridName, columnIndex, newWidth)
          }
          onColumnMove={(oldIndex: number, newIndex: number) => onColumnMove(masterGridName, oldIndex, newIndex)}
          onSelectRow={(idx: number, selected: boolean) => onSelectRow(masterRS, idx, selected)}
          onSelectAllRows={(value: boolean) => onSelectAllRows(masterRS, value)}
          onSetCursorPos={(cursorCol: number, cursorRow: number) =>
            onSetCursorPos(masterRS, masterGridName, cursorCol, cursorRow)
          }
          onSort={(rs: RecordSet, sortFields: SortFields) => onSort(rs, sortFields, this._gridRef[masterGridName])}
          onToggleGroup={(rowIdx: number) => onToggleGroup(masterRS, rowIdx)}
          ref={(grid: GDMNGrid) => grid && (this._gridRef[masterGridName] = grid)}
        />
      </div>
    );
  }

  public render() {
    if (!this.isDataLoaded()) {
      return this.renderLoading();
    }

    const { data } = this.props;

    if (data!.detail && data!.detail![0].rs) {
      return this.renderMD();
    } else {
      return this.renderS();
    }
  }
}


