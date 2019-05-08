import { State } from '../store';
import { connect } from 'react-redux';
import { RecordSetView } from './recordSetView';
import { RSAction, rsActions } from 'gdmn-recordset';
import {
  GridAction,
  cancelSortDialog,
  applySortDialog,
  resizeColumn,
  columnMove,
  setCursorCol,
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
import { ThunkDispatch } from 'redux-thunk';
import { RouteComponentProps } from 'react-router';

export const RecordSetViewContainer = connect(
  (state: State, ownProps: RouteComponentProps<{ name: string }>) => {
    const name = ownProps.match.params.name;

    return {
      grid: state.grid[name],
      rs: state.recordSet[name]
    };
  },
  (thunkDispatch: ThunkDispatch<State, never, GridAction | RSAction>) => ({
    onCancelSortDialog: (event: TCancelSortDialogEvent) => thunkDispatch(
      cancelSortDialog({name: event.rs.name})
    ),
    onApplySortDialog: (event: TApplySortDialogEvent) => thunkDispatch(
      (dispatch, getState) => {
        dispatch(applySortDialog({ name: event.rs.name, sortFields: event.sortFields }));
        dispatch(rsActions.sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));
        event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
      }
    ),
    onColumnResize: (event: TColumnResizeEvent) => thunkDispatch(
      resizeColumn({name: event.rs.name, columnIndex: event.columnIndex, newWidth: event.newWidth})
    ),
    onColumnMove: (event: TColumnMoveEvent) => thunkDispatch(
      columnMove({name: event.rs.name, oldIndex: event.oldIndex, newIndex: event.newIndex})
    ),
    onSelectRow: (event: TSelectRowEvent) => thunkDispatch(
      rsActions.selectRow({name: event.rs.name, idx: event.idx, selected: event.selected})
    ),
    onSelectAllRows: (event: TSelectAllRowsEvent) => thunkDispatch(
      rsActions.setAllRowsSelected({name: event.rs.name, value: event.value})
    ),
    onSetCursorPos: (event: TSetCursorPosEvent) => thunkDispatch(
      (dispatch, getState) => {
        const recordSet = getState().recordSet[event.rs.name];
        if (recordSet) {
          dispatch(rsActions.setRecordSet({ name: event.rs.name, rs: recordSet.setCurrentRow(event.cursorRow) }));
          dispatch(setCursorCol({ name: event.rs.name, cursorCol: event.cursorCol }));
        }
      }
    ),
    onSort: (event: TSortEvent) => thunkDispatch(
      (dispatch: ThunkDispatch<State, never, RSAction>, getState: () => State) => {
        dispatch(rsActions.sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));
        event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
      }
    ),
    onToggleGroup: (event: TToggleGroupEvent) => thunkDispatch(
      rsActions.toggleGroup({ name: event.rs.name, rowIdx: event.rowIdx })
    )
  })
)(RecordSetView);
