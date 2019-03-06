import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { compose } from 'recompose';
import {
  applySortDialog,
  cancelSortDialog,
  columnMove,
  GridAction,
  resizeColumn,
  setCursorCol,
  TOnApplySortDialogEvent,
  TOnCancelSortDialogEvent,
  TOnColumnMoveEvent,
  TOnColumnResizeEvent,
  TOnSelectAllRowsEvent,
  TOnSelectRowEvent,
  TOnSetCursorPosEvent,
  TOnSortEvent,
  TOnToggleGroupEvent
} from "gdmn-grid";
import {
  RecordSetAction,
  selectRow,
  setAllRowsSelected,
  setRecordSet,
  sortRecordSet,
  toggleGroup
} from 'gdmn-recordset';
import { IState } from '@src/app/store/reducer';
import { connectView } from './connectView';
import { TGdmnActions } from '../scenes/gdmn/actions';
import { IDataViewProps } from './DataView';

export const connectDataView = compose<any, IDataViewProps<any>>(
  connect(
    (state: IState) => ({
      erModel:
        state.gdmnState.erModel && Object.keys(state.gdmnState.erModel.entities).length
          ? state.gdmnState.erModel
          : undefined // todo перенести
    }),
    (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction | TGdmnActions>) => ({

      onCancelSortDialog: (event: TOnCancelSortDialogEvent) =>
        dispatch(
          cancelSortDialog({ name: event.rs.name })
        ),

      onApplySortDialog: (event: TOnApplySortDialogEvent) =>
        dispatch((dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>, getState: () => IState) => {
          dispatch(applySortDialog({ name: event.rs.name, sortFields: event.sortFields }));
          dispatch(sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));

          event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
        }),

      onColumnResize: (event: TOnColumnResizeEvent) =>
        dispatch(
          resizeColumn({
            name: event.rs.name,
            columnIndex: event.columnIndex,
            newWidth: event.newWidth
          })
        ),

      onColumnMove: (event: TOnColumnMoveEvent) =>
        dispatch(
          columnMove({
            name: event.rs.name,
            oldIndex: event.oldIndex,
            newIndex: event.newIndex
          })
        ),

      onSelectRow: (event: TOnSelectRowEvent) =>
        dispatch(
          selectRow({
            name: event.rs.name,
            idx: event.idx,
            selected: event.selected
          })
        ),

      onSelectAllRows: (event: TOnSelectAllRowsEvent) =>
        dispatch(
          setAllRowsSelected({
            name: event.rs.name,
            value: event.value
          })
        ),

      onSetCursorPos: (event: TOnSetCursorPosEvent) => {
        dispatch(
          setRecordSet({
            name: event.rs.name,
            rs: event.rs.setCurrentRow(event.cursorRow)
          })
        );

        dispatch(
          setCursorCol({
            name: event.rs.name,
            cursorCol: event.cursorCol
          })
        );
      },

      onSort: (event: TOnSortEvent) =>
        dispatch((dispatch: ThunkDispatch<IState, never, RecordSetAction>, getState: () => IState) => {
          dispatch(
            sortRecordSet({
              name: event.rs.name,
              sortFields: event.sortFields
            })
          );

          event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
        }),

      onToggleGroup: (event: TOnToggleGroupEvent) =>
        dispatch(
          toggleGroup({
            name: event.rs.name,
            rowIdx: event.rowIdx
          })
        )
    })
  ),
  connectView
);
