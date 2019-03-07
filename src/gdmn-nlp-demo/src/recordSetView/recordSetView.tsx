import React, { Component } from "react";
import { RecordSet, SortFields } from 'gdmn-recordset';
import { GridComponentState, GDMNGrid } from 'gdmn-grid';
import './recordSetView.css';

export interface IRecordSetViewProps {
  recordSet: RecordSet,
  grid: GridComponentState,
  mountGrid: () => void;
  unmountGrid: () => void;
  onCancelSortDialog: () => void;
  onApplySortDialog: (sortFields: SortFields) => void;
  onColumnResize: (columnIndex: number, newWidth: number) => void;
  onColumnMove: (oldIndex: number, newIndex: number) => void;
  onSetCursorPos: (cursorCol: number, cursorRow: number) => void;
  onSort: (rs: RecordSet, sortFields: SortFields) => void;
  onSelectRow: (idx: number, selected: boolean) => void;
  onSelectAllRows: (value: boolean) => void;
  onToggleGroup: (rowIdx: number) => void;
};

export class RecordSetView extends Component<IRecordSetViewProps, {}> {

  componentDidMount() {
    this.props.mountGrid();
  }

  componentWillUnmount() {
    this.props.unmountGrid();
  }
  render() {
    const { recordSet, grid } = this.props;

    if (!grid) {
      return <div/>;
    }
    return (
      <div className="GridArea" key='db'>
        <GDMNGrid {...grid} rs={recordSet}/>
      </div>
    );
  }
}
