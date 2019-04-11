import * as React from 'react';
import { NumberInput } from './NumberInput';
import { ColumnSelector } from './ColumnSelector';
import { Columns } from './Grid';
import './GridPanel.css';
import { RecordSet } from 'gdmn-recordset';
import { ParamsDialog } from './ParamsDialog';

export interface IGridPanelEvent {
  rs: RecordSet;
}

export type TOnFilterEvent = IGridPanelEvent & {filter: string};

export type TOnFilter = (event: TOnFilterEvent) => void;

export interface IGDMNGridPanelProps {
  rs: RecordSet;
  visibleColumns: Columns;
  columns: Columns;
  leftSideColumns: number;
  rightSideColumns: number;
  currentCol: number;
  selectRows: boolean;
  hideFooter: boolean;
  hideHeader: boolean;
  sortDialog: boolean;
  paramsDialog: boolean;
  searchIdx: number;
  onSortDialog: () => void;
  onScrollIntoView: () => void;
  onSetFixedColumns: (fixedColumns: number) => void;
  onSetFixedTailColumns: (fixedTailColumns: number) => void;
  onGoToRow: (rowNumber: number) => void;
  onSetSelectRows: (value: boolean) => void;
  onToggleHideFooter: () => void;
  onToggleHideHeader: () => void;
  onSetFilter: (filter: string) => void;
  onSearch: (searchText: string) => void;
  onJumpToSearch: (searchIdx: number, moveBy: number, rs: RecordSet, columns: Columns) => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  onParamsDialog: () => void;
  onToggle: (columnName: string) => void;
  onCancelParamsDialog: () => void;
  onDeleteRow: () => void;
  onRemoveDeleted: () => void;
}

export class GDMNGridPanel extends React.Component<IGDMNGridPanelProps, {}> {
  private handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSetFilter(e.target.value);
  };

  private handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSearch(e.target.value);
  };

  render() {
    const {
      columns,
      leftSideColumns,
      onSetFixedColumns,
      rightSideColumns,
      onSetFixedTailColumns,
      rs,
      currentCol,
      selectRows,
      onSetSelectRows,
      hideFooter,
      hideHeader,
      onToggleHideFooter,
      onToggleHideHeader,
      onSortDialog,
      onScrollIntoView,
      onGoToRow,
      searchIdx,
      onJumpToSearch,
      onCollapseAll,
      onExpandAll,
      paramsDialog,
      onParamsDialog,
      onCancelParamsDialog,
      onToggle,
      onDeleteRow,
      onRemoveDeleted
    } = this.props;
    const filter = rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';
    const searchStr = rs.searchStr || '';
    const currentRow = rs.currentRow;
    return (
      <div className="GDMNGridPanel">
        {/* <ColumnsListView columnsList={columns} onToggle={onToggle}/> */}
        <NumberInput
          value={leftSideColumns}
          label="Left side columns:"
          onChange={onSetFixedColumns}
          size={2}
          pattern="[0-9]*"
          name="leftSideColumns"
        />
        <NumberInput
          value={rightSideColumns}
          label="Right side columns:"
          onChange={onSetFixedTailColumns}
          size={2}
          pattern="[0-9]*"
          name="rightSideColumns"
        />
        <NumberInput
          value={currentRow}
          label="Go to row:"
          onChange={onGoToRow}
          size={4}
          pattern="[0-9]*"
          name="gotoRow"
        />
        <ColumnSelector isChecked={selectRows} name="Select rows" onToggle={() => onSetSelectRows(!selectRows)} />
        <ColumnSelector isChecked={!hideFooter} name="Show footer" onToggle={onToggleHideFooter} />
        <ColumnSelector isChecked={!hideHeader} name="Show header" onToggle={onToggleHideHeader} />
        <span>Col: {currentCol};</span>
        <span>Row: {currentRow}</span>
        <span>Total: {rs.size}</span>
        <button onClick={onSortDialog}>Sort...</button>
        <button onClick={onScrollIntoView}>Scroll into view...</button>
        <button onClick={onCollapseAll}>Collapse</button>
        <button onClick={onExpandAll}>Expand</button>
        <button onClick={onParamsDialog}>Params dialog</button>
        <button onClick={onDeleteRow}>Delete</button>
        <button onClick={onRemoveDeleted}>Remove</button>
        {paramsDialog ? (
          <ParamsDialog onCancel={onCancelParamsDialog} columns={columns} onToggle={onToggle} />
        ) : (
          undefined
        )}
        <div>
          <label htmlFor="filter">Filter:</label>
          <input type="text" onChange={this.handleFilter} value={filter} name="filter" size={40} />
        </div>
        <div>
          <label htmlFor="search">Search:</label>
          <input type="text" onChange={this.handleSearch} value={searchStr} name="search" size={40} />
          <button onClick={() => onJumpToSearch(searchIdx, 1, rs, columns)}>▽</button>
          <button onClick={() => onJumpToSearch(searchIdx, -1, rs, columns)}>△</button>
          {rs.foundRows ? `${searchIdx + 1} of ${rs.foundNodesCount} matches` : ''}
        </div>
      </div>
    );
  }
}
