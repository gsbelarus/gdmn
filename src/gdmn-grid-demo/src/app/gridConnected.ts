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
import { RecordSet, setFilter, doSearch, toggleGroup, collapseExpandGroups, setRecordSet } from "gdmn-recordset";
import { GDMNGridPanel, GetConditionalStyle } from "gdmn-grid";
import { sortRecordSet, selectRow, setAllRowsSelected } from "gdmn-recordset";
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
    (thunkDispatch: ThunkDispatch<State, never, GridAction | RecordSetAction>) => ({
      onCancelSortDialog:
        () => thunkDispatch(cancelSortDialog({name})),
      onApplySortDialog:
        (sortFields: SortFields) => thunkDispatch(
          (dispatch, getState) => {
            dispatch(applySortDialog({ name, sortFields }));
            dispatch(sortRecordSet({ name: rs.name, sortFields }));
            getGridRef().scrollIntoView(getState().recordSet[rs.name].currentRow);
          }
        ),
      onColumnResize:
        (columnIndex: number, newWidth: number) => thunkDispatch(resizeColumn({name, columnIndex, newWidth})),
      onColumnMove:
        (oldIndex: number, newIndex: number) => thunkDispatch(columnMove({name, oldIndex, newIndex})),
      onSelectRow:
        (idx: number, selected: boolean) => thunkDispatch(selectRow({name, idx, selected})),
      onSelectAllRows:
        (value: boolean) => thunkDispatch(setAllRowsSelected({name, value})),
      onSetCursorPos:
        (cursorCol: number, cursorRow: number) => thunkDispatch(
          (dispatch, getState) => {
            const recordSet = getState().recordSet[rs.name];
            if (recordSet) {
              dispatch(setRecordSet({ name: rs.name, rs: recordSet.setCurrentRow(cursorRow) }));
              dispatch(setCursorCol({ name, cursorCol }));
            }
          }
        ),
      onSort:
        (rs: RecordSet, sortFields: SortFields) => thunkDispatch(
          (dispatch: ThunkDispatch<State, never, RecordSetAction>, getState: () => State) => {
            dispatch(sortRecordSet({ name: rs.name, sortFields }));
            getGridRef().scrollIntoView(getState().recordSet[rs.name].currentRow);
          }
        ),
      onToggleGroup:
        (rowIdx: number) => thunkDispatch(toggleGroup({ name: rs.name, rowIdx }))
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
    (thunkDispatch: ThunkDispatch<State, never, GridAction | RecordSetAction>) => ({
      onSortDialog:
        () => thunkDispatch(showSortDialog({name})),
      onScrollIntoView:
        () => getGridRef().scrollIntoView(-1),
      onSetFixedColumns:
        (leftSideColumns: number) => thunkDispatch(setFixedColumns({name, leftSideColumns})),
      onSetFixedTailColumns:
        (rightSideColumns: number) => thunkDispatch(setFixedTailColumns({name, rightSideColumns})),
      onGoToRow:
        (rowNumber: number) => thunkDispatch( (dispatch, getState) => {
          const recordSet = getState().recordSet[rs.name];
          if (recordSet) {
            dispatch(setRecordSet({ name: rs.name, rs: recordSet.setCurrentRow(rowNumber) }));
            getGridRef().scrollIntoView(rowNumber);
          }
        }),
      onToggle:
        (columnName: string) => thunkDispatch(toggleColumn({name, columnName})),
      onSetSelectRows:
        (value: boolean) => thunkDispatch(setSelectRows({name, value})),
      onToggleHideFooter:
        () => thunkDispatch(toggleHideFooter({name})),
      onToggleHideHeader:
        () => thunkDispatch(toggleHideHeader({name})),
      onCollapseAll:
        () => thunkDispatch(collapseExpandGroups({ name: rs.name, collapse: true })),
      onExpandAll:
        () => thunkDispatch(collapseExpandGroups({ name: rs.name, collapse: false })),
      onSetFilter:
        (filter: string) => {
          if (filter) {
            thunkDispatch(setFilter({name: rs.name, filter: { conditions: [ { value: filter } ] } }))
          } else {
            thunkDispatch(setFilter({name: rs.name, filter: undefined }))
          }
        },
      onSearch:
        (searchText: string) => {
          thunkDispatch(doSearch({ name: rs.name, searchStr: searchText ? searchText : undefined }))
          thunkDispatch(setSearchIdx({ name, searchIdx: 0 }));
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

        thunkDispatch(setSearchIdx({ name, searchIdx: newSearchIdx }));
        thunkDispatch(setCursorCol({ name, cursorCol }));
        thunkDispatch( (dispatch, getState) => {
          const recordSet = getState().recordSet[rs.name];
          if (recordSet) {
            dispatch(setRecordSet({ name: rs.name, rs: recordSet.setCurrentRow(foundNode.rowIdx) }));
          }
        });
        getGridRef().scrollIntoView(foundNode.rowIdx, cursorCol);
      }
    })
  )(GDMNGridPanel);
};

export type ConnectedGridPanel = ReturnType<typeof connectGridPanel>;
