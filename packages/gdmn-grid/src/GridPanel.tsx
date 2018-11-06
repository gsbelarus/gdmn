import * as React from 'react';
import { ColumnsListView } from './ColumnsListView';
import { NumberInput } from './NumberInput';
import { ColumnSelector } from './ColumnSelector';
import { Columns } from './Grid';
import './GridPanel.css';
import { RecordSet } from 'gdmn-recordset';

export interface IGDMNGridPanelProps {
  rs: RecordSet,
  visibleColumns: Columns,
  columns: Columns,
  leftSideColumns: number,
  rightSideColumns: number,
  currentCol: number,
  selectRows: boolean,
  hideFooter: boolean,
  hideHeader: boolean,
  sortDialog: boolean,
  searchText: string,
  onSortDialog: () => void,
  onScrollIntoView: () => void,
  onSetFixedColumns: (fixedColumns: number) => void,
  onSetFixedTailColumns: (fixedTailColumns: number) => void,
  onGoToRow: (rowNumber: number) => void,
  onToggle: (columnName: string) => void,
  onSetSelectRows: (value: boolean) => void,
  onToggleHideFooter: () => void,
  onToggleHideHeader: () => void,
  onSetFilter: (filter: string) => void,
  onSearch: (searchText: string) => void
};

export class GDMNGridPanel extends React.Component<IGDMNGridPanelProps, {}> {

  private handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSetFilter(e.target.value);
  }

  private handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSearch(e.target.value);
  }

  render() {
    const {
      columns, onToggle, leftSideColumns, onSetFixedColumns,
      rightSideColumns, onSetFixedTailColumns, rs, currentCol,
      selectRows, onSetSelectRows, hideFooter, hideHeader,
      onToggleHideFooter, onToggleHideHeader, onSortDialog,
      onScrollIntoView, onGoToRow, searchText } = this.props;
    const filter = rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';
    const currentRow = rs.currentRow;
    return (
      <div className="GDMNGridPanel">
        <ColumnsListView columnsList={columns} onToggle={onToggle}/>
        <NumberInput value={leftSideColumns} label="Left side columns:" onChange={onSetFixedColumns} size={2} pattern="[0-9]*" name='leftSideColumns'/>
        <NumberInput value={rightSideColumns} label="Right side columns:" onChange={onSetFixedTailColumns} size={2} pattern="[0-9]*" name='rightSideColumns' />
        <NumberInput value={currentRow} label="Go to row:" onChange={onGoToRow} size={4} pattern="[0-9]*" name='gotoRow'/>
        <ColumnSelector isChecked={selectRows} name="Select rows" onToggle={() => onSetSelectRows(!selectRows)} />
        <ColumnSelector isChecked={!hideFooter} name="Show footer" onToggle={onToggleHideFooter} />
        <ColumnSelector isChecked={!hideHeader} name="Show header" onToggle={onToggleHideHeader} />
        <span>Col: {currentCol};</span><span>Row: {currentRow}</span>
        <button onClick={onSortDialog}>
          Sort...
        </button>
        <button onClick={onScrollIntoView}>
          Scroll into view...
        </button>
        <div>
          <label htmlFor="filter">
            Filter:
          </label>
          <input
            type="text"
            onChange={this.handleFilter}
            value={filter}
            name="filter"
            size={40}
          />
        </div>
        <div>
          <label htmlFor="search">
            Search:
          </label>
          <input
            type="text"
            onChange={this.handleSearch}
            value={searchText}
            name="search"
            size={40}
          />
          <button>
            ▽
          </button>
          <button>
            △
          </button>
          {rs.foundRows ? `${rs.foundRows.reduce( (c, r) => r ? c + 1 : c, 0 )} matches` : ''}
        </div>
      </div>
    );
  }
};