import { ThunkDispatch } from 'redux-thunk';
import { IState } from '@src/app/store/reducer';
import {
  GridAction,
  IColumn,
  GetGridRef,
  createGrid,
  cancelSortDialog,
  applySortDialog,
  resizeColumn,
  columnMove,
  setCursorCol,
  GDMNGrid
} from 'gdmn-grid';
import {
  RecordSet,
  RecordSetAction,
  SortFields,
  sortRecordSet,
  selectRow,
  setAllRowsSelected,
  setCurrentRow,
  toggleGroup,
  TFieldType
} from 'gdmn-recordset';
import { connect } from 'react-redux';

export function getGridContainer(
  disp: ThunkDispatch<IState, never, GridAction>,
  name: string,
  rs: RecordSet,
  columns: IColumn[] | undefined,
  getGridRef: GetGridRef
) {
  disp(
    createGrid({
      name,
      columns:
        columns ||
        rs.fieldDefs.map(fd => ({
          name: fd.fieldName,
          caption: [fd.caption || fd.fieldName],
          fields: [{ ...fd }],
          width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
        })),
      leftSideColumns: 0,
      rightSideColumns: 0
      // hideFooter: true //  fixme: type
    })
  );

  return connect(
    (state: IState) => {
      const gridComponentState = state.grid[name];
      return {
        ...gridComponentState,
        columns: gridComponentState.columns.filter(c => !c.hidden)
      };
    },
    (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>) => ({
      onCancelSortDialog: () => dispatch(cancelSortDialog({ name })),
      onApplySortDialog: (sortFields: SortFields) =>
        dispatch((dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>, getState: () => IState) => {
          dispatch(applySortDialog({ name, sortFields }));
          dispatch(sortRecordSet({ name: rs.name, sortFields }));
          getGridRef().scrollIntoView(getState().recordSet[rs.name].currentRow);
        }),
      onColumnResize: (columnIndex: number, newWidth: number) =>
        dispatch(resizeColumn({ name, columnIndex, newWidth })),
      onColumnMove: (oldIndex: number, newIndex: number) => dispatch(columnMove({ name, oldIndex, newIndex })),
      onSelectRow: (idx: number, selected: boolean) => dispatch(selectRow({ name, idx, selected })),
      onSelectAllRows: (value: boolean) => dispatch(setAllRowsSelected({ name, value })),
      onSetCursorPos: (cursorCol: number, cursorRow: number) => {
        dispatch(setCurrentRow({ name: rs.name, currentRow: cursorRow }));
        dispatch(setCursorCol({ name, cursorCol }));
      },
      onSort: (rs: RecordSet, sortFields: SortFields) =>
        dispatch((dispatch: ThunkDispatch<IState, never, RecordSetAction>, getState: () => IState) => {
          dispatch(sortRecordSet({ name: rs.name, sortFields }));
          getGridRef().scrollIntoView(getState().recordSet[rs.name].currentRow);
        }),
      onToggleGroup: (rowIdx: number) => dispatch(toggleGroup({ name: rs.name, rowIdx }))
    }),
    null,
    { withRef: true }
  )(GDMNGrid);
}

export type ConnectedGrid = ReturnType<typeof getGridContainer>;
