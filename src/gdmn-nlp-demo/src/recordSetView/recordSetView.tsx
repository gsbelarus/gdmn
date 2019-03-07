import React, { Component } from "react";
import { RecordSet, SortFields } from 'gdmn-recordset';
import {
  GridComponentState,
  GDMNGrid,
  TEventCallback,
  TCancelSortDialogEvent,
  TApplySortDialogEvent,
  TColumnResizeEvent,
  TColumnMoveEvent,
  TSelectRowEvent,
  TSelectAllRowsEvent,
  TSetCursorPosEvent,
  TSortEvent,
  TToggleGroupEvent
} from 'gdmn-grid';
import './recordSetView.css';

export interface IRecordSetViewProps {
  recordSet: RecordSet,
  grid: GridComponentState,
  mountGrid: () => void;
  unmountGrid: () => void;
  onCancelSortDialog: TEventCallback<TCancelSortDialogEvent>;
  onApplySortDialog: TEventCallback<TApplySortDialogEvent>;
  onColumnResize: TEventCallback<TColumnResizeEvent>;
  onColumnMove: TEventCallback<TColumnMoveEvent>;
  onSelectRow: TEventCallback<TSelectRowEvent>;
  onSelectAllRows: TEventCallback<TSelectAllRowsEvent>;
  onSetCursorPos: TEventCallback<TSetCursorPosEvent>;
  onSort: TEventCallback<TSortEvent>;
  onToggleGroup: TEventCallback<TToggleGroupEvent>;
};

export class RecordSetView extends Component<IRecordSetViewProps, {}> {

  componentDidMount() {
    this.props.mountGrid();
  }

  componentWillUnmount() {
    this.props.unmountGrid();
  }

  render() {
    const { recordSet, grid, ...callbacks } = this.props;

    if (!grid) {
      return null;
    }
    return (
      <div className="GridArea" key='db'>
        <GDMNGrid {...grid} {...callbacks} rs={recordSet}/>
      </div>
    );
  }
}
