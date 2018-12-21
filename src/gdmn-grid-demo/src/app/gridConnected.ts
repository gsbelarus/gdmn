import { GDMNGrid, IColumn, Columns, setSearchIdx, GetGridRef } from "gdmn-grid";
import { connect } from "react-redux";
import store, { State } from "../app/store";
import { GridAction } from "gdmn-grid";
import { ThunkDispatch } from "redux-thunk";
import {
  resizeColumn,
  columnMove,
  setCursorCol,
  createGrid,
  deleteGrid,
  setFixedColumns,
  setFixedTailColumns,
  toggleColumn,
  setSelectRows,
  toggleHideFooter,
  toggleHideHeader,
  showSortDialog,
  cancelSortDialog,
  applySortDialog,
} from "gdmn-grid";
import { RecordSet, setFilter, doSearch, toggleGroup, collapseExpandGroups } from "gdmn-recordset";
import { GDMNGridPanel, GetConditionalStyle } from "gdmn-grid";
import { sortRecordSet, setCurrentRow, selectRow, setAllRowsSelected } from "gdmn-recordset";
import { RecordSetAction } from "gdmn-recordset";
import { SortFields } from "gdmn-recordset";

export function connectGrid(name: string, rs: RecordSet, columns: IColumn[] | undefined, getConditionalStyle: GetConditionalStyle | undefined, getGridRef: GetGridRef) {
  store.dispatch(createGrid({name,
    columns: columns || rs.fieldDefs.map( fd => (
      {
        name: fd.fieldName,
        caption: [fd.caption || fd.fieldName],
        fields: [{...fd}]
      })),
    leftSideColumns: 0,
    rightSideColumns: 0,
    hideFooter: false,
    getConditionalStyle
  }));

  return connect(
    (state: State) => {
      const gridComponentState = state.grid[name];
      return {
        ...gridComponentState,
        columns: gridComponentState.columns.filter( c => !c.hidden )
      }
    },
    (dispatch: ThunkDispatch<State, never, GridAction | RecordSetAction>) => ({
      onCancelSortDialog:
        () => dispatch(cancelSortDialog({name})),
      onApplySortDialog:
        (sortFields: SortFields) => dispatch(
          (dispatch: ThunkDispatch<State, never, GridAction | RecordSetAction>, getState: () => State) => {
            dispatch(applySortDialog({ name, sortFields }));
            dispatch(sortRecordSet({ name: rs.name, sortFields }));
            getGridRef().scrollIntoView(getState().recordSet[rs.name].currentRow);
          }
        ),
      onColumnResize:
        (columnIndex: number, newWidth: number) => dispatch(resizeColumn({name, columnIndex, newWidth})),
      onColumnMove:
        (oldIndex: number, newIndex: number) => dispatch(columnMove({name, oldIndex, newIndex})),
      onSelectRow:
        (idx: number, selected: boolean) => dispatch(selectRow({name, idx, selected})),
      onSelectAllRows:
        (value: boolean) => dispatch(setAllRowsSelected({name, value})),
      onSetCursorPos:
        (cursorCol: number, cursorRow: number) => {
          dispatch(setCurrentRow({ name: rs.name, currentRow: cursorRow }));
          dispatch(setCursorCol({ name, cursorCol }));
        },
      onSort:
        (rs: RecordSet, sortFields: SortFields) => dispatch(
          (dispatch: ThunkDispatch<State, never, RecordSetAction>, getState: () => State) => {
            dispatch(sortRecordSet({ name: rs.name, sortFields }));
            getGridRef().scrollIntoView(getState().recordSet[rs.name].currentRow);
          }
        ),
      onToggleGroup:
        (rowIdx: number) => dispatch(toggleGroup({ name: rs.name, rowIdx }))
    }),
    null,
    { withRef: true }
  )(GDMNGrid);
};

export type ConnectedGrid = ReturnType<typeof connectGrid>;

export function dropGrid(name: string) {
  store.dispatch(deleteGrid({name}));
};

export function connectGridPanel(name: string, rs: RecordSet, getGridRef: GetGridRef) {
  return connect(
    (state: State) => {
      const gridComponentState = state.grid[name];

      return {
        ...gridComponentState,
        visibleColumns: gridComponentState.columns.filter( c => !c.hidden )
      }
    },
    (dispatch: ThunkDispatch<State, never, GridAction | RecordSetAction>) => ({
      onSortDialog:
        () => dispatch(showSortDialog({name})),
      onScrollIntoView:
        () => getGridRef().scrollIntoView(-1),
      onSetFixedColumns:
        (leftSideColumns: number) => dispatch(setFixedColumns({name, leftSideColumns})),
      onSetFixedTailColumns:
        (rightSideColumns: number) => dispatch(setFixedTailColumns({name, rightSideColumns})),
      onGoToRow:
        (rowNumber: number) => {
          dispatch(setCurrentRow({ name: rs.name, currentRow: rowNumber }));
          getGridRef().scrollIntoView(rowNumber);
        },
      onToggle:
        (columnName: string) => dispatch(toggleColumn({name, columnName})),
      onSetSelectRows:
        (value: boolean) => dispatch(setSelectRows({name, value})),
      onToggleHideFooter:
        () => dispatch(toggleHideFooter({name})),
      onToggleHideHeader:
        () => dispatch(toggleHideHeader({name})),
      onCollapseAll:
        () => dispatch(collapseExpandGroups({ name: rs.name, collapse: true })),
      onExpandAll:
        () => dispatch(collapseExpandGroups({ name: rs.name, collapse: false })),
      onSetFilter:
        (filter: string) => {
          if (filter) {
            dispatch(setFilter({name: rs.name, filter: { conditions: [ { value: filter } ] } }))
          } else {
            dispatch(setFilter({name: rs.name, filter: undefined }))
          }
        },
      onSearch:
        (searchText: string) => {
          dispatch(doSearch({ name: rs.name, searchStr: searchText ? searchText : undefined }))
          dispatch(setSearchIdx({ name, searchIdx: 0 }));
        },
      onJumpToSearch: (searchIdx: number, moveBy: number, rs: RecordSet, columns: Columns) => {
        const foundNodesCount = rs.foundNodesCount;

        if (!foundNodesCount) return;

        let newSearchIdx = searchIdx + moveBy;
        if (newSearchIdx < 0) {
          newSearchIdx = foundNodesCount - 1;
        }
        else if (newSearchIdx >= foundNodesCount) {
          newSearchIdx = 0;
        }

        const foundNode = rs.foundNodes![newSearchIdx];
        const cursorCol = columns.findIndex( c => c.fields.some( f => f.fieldName === foundNode.fieldName ) );

        dispatch(setSearchIdx({ name, searchIdx: newSearchIdx }));
        dispatch(setCursorCol({ name, cursorCol }));
        dispatch(setCurrentRow({ name: rs.name, currentRow: foundNode.rowIdx }));
        getGridRef().scrollIntoView(foundNode.rowIdx, cursorCol);
      }
    })
  )(GDMNGridPanel);
};

export type ConnectedGridPanel = ReturnType<typeof connectGridPanel>;
