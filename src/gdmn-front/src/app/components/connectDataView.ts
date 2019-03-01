import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { compose } from 'recompose';
import {
  applySortDialog,
  cancelSortDialog,
  columnMove,
  GDMNGrid,
  GridAction,
  resizeColumn,
  setCursorCol
} from 'gdmn-grid';
import {
  RecordSet,
  RecordSetAction,
  selectRow,
  setAllRowsSelected,
  setRecordSet,
  SortFields,
  sortRecordSet,
  toggleGroup
} from 'gdmn-recordset';

import { IState } from '@src/app/store/reducer';
import { connectView } from './connectView';
import { IViewTab } from '../scenes/gdmn/types';
import { gdmnActions, TGdmnActions } from '../scenes/gdmn/actions';

export const connectDataView = compose(
  connectView,
  connect(
    (state: IState) => ({
      erModel:
        state.gdmnState.erModel && Object.keys(state.gdmnState.erModel.entities).length
          ? state.gdmnState.erModel
          : undefined // todo перенести
    }),
    (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction | TGdmnActions>) => ({
      updateViewTab: (viewTab: IViewTab) => dispatch(gdmnActions.updateViewTab(viewTab)),

      onCancelSortDialog: (gridName: string) => dispatch(cancelSortDialog({ name: gridName })),

      onApplySortDialog: (rs: RecordSet, gridName: string, sortFields: SortFields, gridRef?: GDMNGrid) =>
        dispatch((dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>, getState: () => IState) => {
          dispatch(applySortDialog({ name: gridName, sortFields }));
          dispatch(sortRecordSet({ name: rs.name, sortFields }));
          if (gridRef) {
            gridRef.scrollIntoView(getState().recordSet[rs.name].currentRow);
          }
        }),

      onColumnResize: (gridName: string, columnIndex: number, newWidth: number) =>
        dispatch(
          resizeColumn({
            name: gridName,
            columnIndex,
            newWidth
          })
        ),

      onColumnMove: (gridName: string, oldIndex: number, newIndex: number) =>
        dispatch(
          columnMove({
            name: gridName,
            oldIndex,
            newIndex
          })
        ),

      onSelectRow: (rs: RecordSet, idx: number, selected: boolean) =>
        dispatch(
          selectRow({
            name: rs.name,
            idx,
            selected
          })
        ),

      onSelectAllRows: (rs: RecordSet, value: boolean) =>
        dispatch(
          setAllRowsSelected({
            name: rs.name,
            value
          })
        ),

      onSetCursorPos: (rs: RecordSet, gridName: string, cursorCol: number, cursorRow: number) => {
        dispatch(
          setRecordSet({
            name: rs.name,
            rs: rs.setCurrentRow(cursorRow)
          })
        );

        dispatch(
          setCursorCol({
            name: gridName,
            cursorCol
          })
        );
      },

      onSort: (rs: RecordSet, sortFields: SortFields, gridRef?: GDMNGrid) =>
        dispatch((dispatch: ThunkDispatch<IState, never, RecordSetAction>, getState: () => IState) => {
          dispatch(
            sortRecordSet({
              name: rs.name,
              sortFields
            })
          );

          if (gridRef) {
            gridRef.scrollIntoView(getState().recordSet[rs.name].currentRow);
          }
        }),

      onToggleGroup: (rs: RecordSet, rowIdx: number) =>
        dispatch(
          toggleGroup({
            name: rs.name,
            rowIdx
          })
        )
    })
  )
);
