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
  TApplySortDialogEvent,
  TCancelSortDialogEvent,
  TColumnMoveEvent,
  TColumnResizeEvent,
  TSelectAllRowsEvent,
  TSelectRowEvent,
  TSetCursorPosEvent,
  TSortEvent,
  TToggleGroupEvent,
  TOnFilterEvent
} from "gdmn-grid";
import {
  RecordSetAction,
  selectRow,
  setAllRowsSelected,
  setRecordSet,
  sortRecordSet,
  toggleGroup,
  setFilter
} from 'gdmn-recordset';
import { IState } from '@src/app/store/reducer';
import { connectView } from './connectView';
import { TGdmnActions, gdmnActions } from '../scenes/gdmn/actions';
import { IDataViewProps } from './DataView';

export const connectDataView = compose<any, IDataViewProps<any>>(
  connect(
    (state: IState) => ({
      erModel:
        state.gdmnState.erModel && Object.keys(state.gdmnState.erModel.entities).length
          ? state.gdmnState.erModel
          : undefined, // todo перенести
      showInspector: state.gdmnState.showInspector
    }),
    (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction | TGdmnActions>) => ({

      onCancelSortDialog: (event: TCancelSortDialogEvent) =>
        dispatch(
          cancelSortDialog({ name: event.rs.name })
        ),

      onApplySortDialog: (event: TApplySortDialogEvent) =>
        dispatch((dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>, getState: () => IState) => {
          dispatch(applySortDialog({ name: event.rs.name, sortFields: event.sortFields }));
          dispatch(sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));

          event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
        }),

      onColumnResize: (event: TColumnResizeEvent) =>
        dispatch(
          resizeColumn({
            name: event.rs.name,
            columnIndex: event.columnIndex,
            newWidth: event.newWidth
          })
        ),

      onColumnMove: (event: TColumnMoveEvent) =>
        dispatch(
          columnMove({
            name: event.rs.name,
            oldIndex: event.oldIndex,
            newIndex: event.newIndex
          })
        ),

      onSelectRow: (event: TSelectRowEvent) =>
        dispatch(
          selectRow({
            name: event.rs.name,
            idx: event.idx,
            selected: event.selected
          })
        ),

      onSelectAllRows: (event: TSelectAllRowsEvent) =>
        dispatch(
          setAllRowsSelected({
            name: event.rs.name,
            value: event.value
          })
        ),

      onSetCursorPos: (event: TSetCursorPosEvent) => {
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

      onSort: (event: TSortEvent) =>
        dispatch((dispatch: ThunkDispatch<IState, never, RecordSetAction>, getState: () => IState) => {
          dispatch(
            sortRecordSet({
              name: event.rs.name,
              sortFields: event.sortFields
            })
          );

          event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
        }),

      onToggleGroup: (event: TToggleGroupEvent) =>
        dispatch(
          toggleGroup({
            name: event.rs.name,
            rowIdx: event.rowIdx
          })
        ),

      onSetFilter:
        (event: TOnFilterEvent) => {
          if (event.filter) {
            dispatch(setFilter({name: event.rs.name, filter: { conditions: [ { value: event.filter } ] } }))
          } else {
            dispatch(setFilter({name: event.rs.name, filter: undefined }))
          }
        },

      onShowInspector: (showInspector: boolean) => dispatch(gdmnActions.showInspector(showInspector))

    })
  ),
  connectView
);
