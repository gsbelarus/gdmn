import { State } from '../store';
import { connect } from 'react-redux';
import { RecordSetView } from './recordSetView';
import { TFieldType, RecordSetAction, SortFields, sortRecordSet, selectRow, setAllRowsSelected, setRecordSet, RecordSet, toggleGroup } from 'gdmn-recordset';
import { createGrid, deleteGrid, GDMNGrid, GridAction, cancelSortDialog, applySortDialog, resizeColumn, columnMove, setCursorCol } from 'gdmn-grid';
import { ThunkDispatch } from 'redux-thunk';

export const RecordSetViewConteiner = connect(
  (state: State) => ({
      grid: state.grid['db'],
      recordSet: state.recordSet['db']
  }),
  (thunkDispatch: ThunkDispatch<State, never, GridAction | RecordSetAction>) => ({
    mountGrid: () => thunkDispatch(
      (dispatch, getState) => {
        const rs = getState().recordSet['db'];
        dispatch(createGrid({
          name: rs.name,
          columns: rs.fieldDefs.map(fd => ({
            name: fd.fieldName,
            caption: [fd.caption || fd.fieldName],
            fields: [{...fd}],
            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
          })),
          leftSideColumns: 0,
          rightSideColumns: 0,
          hideFooter: true
        }))
      }
    ),
    unmountGrid: () => thunkDispatch(
      (dispatch, getState) => {
        const rs = getState().recordSet['db'];
        dispatch(deleteGrid({name: rs.name}));
      }
    ),
    onCancelSortDialog: () => thunkDispatch(cancelSortDialog({name: 'db'})),
    onApplySortDialog: (sortFields: SortFields) => thunkDispatch(
      (dispatch, getState) => {
        const rs = getState().recordSet['db'];
        dispatch(applySortDialog({ name, sortFields }));
        dispatch(sortRecordSet({ name: rs.name, sortFields }));
        // getGridRef().scrollIntoView(getState().recordSet[rs.name].currentRow);
      }
    ),
    onColumnResize: (columnIndex: number, newWidth: number) => thunkDispatch(resizeColumn({name: 'db', columnIndex, newWidth})),
    onColumnMove: (oldIndex: number, newIndex: number) => thunkDispatch(columnMove({name: 'db', oldIndex, newIndex})),
    onSelectRow: (idx: number, selected: boolean) => thunkDispatch(selectRow({name: 'db', idx, selected})),
    onSelectAllRows: (value: boolean) => thunkDispatch(setAllRowsSelected({name: 'db', value})),
    onSetCursorPos: (cursorCol: number, cursorRow: number) => thunkDispatch(
      (dispatch, getState) => {
        const rs = getState().recordSet['db'];
        dispatch(setRecordSet({ name: rs.name, rs: rs.setCurrentRow(cursorRow) }));
        dispatch(setCursorCol({ name: rs.name, cursorCol }));
      }
    ),
    onSort: (rs: RecordSet, sortFields: SortFields) => thunkDispatch(
      (dispatch: ThunkDispatch<State, never, RecordSetAction>, getState: () => State) => {
        dispatch(sortRecordSet({ name: rs.name, sortFields }));
        // getGridRef().scrollIntoView(getState().recordSet[rs.name].currentRow);
      }
    ),
    onToggleGroup: (rowIdx: number) => thunkDispatch(
      (dispatch, getState) => {
        const rs = getState().recordSet['db'];
        toggleGroup({ name: rs.name, rowIdx })
      }
    )
  })
)(RecordSetView);
