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
  TOnFilterEvent,
  TRecordsetSetFieldValue,
  TRecordsetEvent
} from "gdmn-grid";
import { RSAction, rsActions, RecordSet } from 'gdmn-recordset';
import { IState } from '@src/app/store/reducer';
import { connectView } from './connectView';
import { GdmnAction, gdmnActions } from '../scenes/gdmn/actions';
import { IDataViewProps } from './DataView';
import { loadRSActions, LoadRSActions } from '../store/loadRSActions';
import { RouteComponentProps } from 'react-router';
import { ISessionData } from '../scenes/gdmn/types';

export const connectDataView = compose<any, IDataViewProps<any>>(
  connect(
    (state: IState) => ({
      erModel:
        state.gdmnState.erModel && Object.keys(state.gdmnState.erModel.entities).length
          ? state.gdmnState.erModel
          : undefined, // todo перенести
    }),
    (dispatch: ThunkDispatch<IState, never, GridAction | RSAction | GdmnAction | LoadRSActions>, ownProps: RouteComponentProps<any>) => ({

      refreshRs: (rs: RecordSet) => {
        if (rs.eq) {
          dispatch(loadRSActions.attachRS({ name: rs.name, eq: rs.eq, override: true }))
        }
      },

      onCancelSortDialog: (event: TCancelSortDialogEvent) =>
        dispatch(
          cancelSortDialog({ name: event.rs.name })
        ),

      onApplySortDialog: (event: TApplySortDialogEvent) =>
        dispatch((dispatch: ThunkDispatch<IState, never, GridAction | RSAction>, getState: () => IState) => {
          dispatch(applySortDialog({ name: event.rs.name, sortFields: event.sortFields }));
          dispatch(rsActions.sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));

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
          rsActions.selectRow({
            name: event.rs.name,
            idx: event.idx,
            selected: event.selected
          })
        ),

      onSelectAllRows: (event: TSelectAllRowsEvent) =>
        dispatch(
          rsActions.setAllRowsSelected({
            name: event.rs.name,
            value: event.value
          })
        ),

      onSetCursorPos: (event: TSetCursorPosEvent) => {
        dispatch(
          rsActions.setRecordSet(event.rs.setCurrentRow(event.cursorRow))
        );

        dispatch(
          setCursorCol({
            name: event.rs.name,
            cursorCol: event.cursorCol
          })
        );
      },

      onSort: (event: TSortEvent) =>
        dispatch((dispatch: ThunkDispatch<IState, never, RSAction>, getState: () => IState) => {
          dispatch(
            rsActions.sortRecordSet({
              name: event.rs.name,
              sortFields: event.sortFields
            })
          );

          event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
        }),

      onToggleGroup: (event: TToggleGroupEvent) =>
        dispatch(
          rsActions.toggleGroup({
            name: event.rs.name,
            rowIdx: event.rowIdx
          })
        ),

      onSetFilter:
        (event: TOnFilterEvent) => {
          if (event.filter) {
            dispatch(rsActions.setFilter({name: event.rs.name, filter: { conditions: [ { value: event.filter } ] } }))
          } else {
            dispatch(rsActions.setFilter({name: event.rs.name, filter: undefined }))
          }
        },

      onInsert: (event: TRecordsetEvent) => { dispatch(rsActions.insert({ name: event.rs.name })); },
      onDelete: (event: TRecordsetEvent) => { dispatch(rsActions.deleteRows({ name: event.rs.name })); },
      onCancel: (event: TRecordsetEvent) => { dispatch(rsActions.cancel({ name: event.rs.name })); },
      onSetFieldValue: (event: TRecordsetSetFieldValue) => { dispatch(rsActions.setFieldValue({ name: event.rs.name, fieldName: event.fieldName, value: event.value })); },
      saveSessionData: (sessionData?: ISessionData) => { dispatch(gdmnActions.saveSessionData({ viewTabURL: ownProps.match.url, sessionData })) }
    })
  ),
  connectView
);
