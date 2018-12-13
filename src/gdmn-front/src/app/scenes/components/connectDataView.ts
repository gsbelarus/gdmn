import { ThunkDispatch } from "redux-thunk";
import { IState } from "@src/app/store/reducer";
import { GridAction, cancelSortDialog, GDMNGrid, applySortDialog, resizeColumn, columnMove, setCursorCol } from "gdmn-grid";
import { RecordSetAction, RecordSet, SortFields, sortRecordSet, selectRow, setAllRowsSelected, setCurrentRow, toggleGroup } from "gdmn-recordset";

export const connectDataViewDispatch = (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>) => ({
  onCancelSortDialog:
    (gridName: string) => dispatch(cancelSortDialog({ name: gridName })),

  onApplySortDialog:
    (rs: RecordSet, gridName: string, sortFields: SortFields, gridRef?: GDMNGrid) => dispatch(
      (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>, getState: () => IState) => {
        dispatch(applySortDialog({ name: gridName, sortFields }));
        dispatch(sortRecordSet({ name: rs.name, sortFields }));
        if (gridRef) {
          gridRef.scrollIntoView(getState().recordSet[rs.name].currentRow);
        }
      }
    ),

  onColumnResize:
    (gridName: string, columnIndex: number, newWidth: number) => dispatch(
      resizeColumn({
        name: gridName,
        columnIndex,
        newWidth
      })
    ),

  onColumnMove:
    (gridName: string, oldIndex: number, newIndex: number) => dispatch(
      columnMove({
        name: gridName,
        oldIndex,
        newIndex
      })
    ),

  onSelectRow:
    (rs: RecordSet, idx: number, selected: boolean) => dispatch(
      selectRow({
        name: rs.name,
        idx,
        selected
      })
    ),

  onSelectAllRows:
    (rs: RecordSet, value: boolean) => dispatch(
      setAllRowsSelected({
        name: rs.name,
        value
      })
    ),

  onSetCursorPos:
    (rs: RecordSet, gridName: string, cursorCol: number, cursorRow: number) => {
      dispatch(
        setCurrentRow({
          name: rs.name,
          currentRow: cursorRow
        })
      );

      dispatch(
        setCursorCol({
          name: gridName,
          cursorCol
        })
      );
    },

  onSort:
    (rs: RecordSet, sortFields: SortFields, gridRef?: GDMNGrid) => dispatch(
      (dispatch: ThunkDispatch<IState, never, RecordSetAction>, getState: () => IState) => {
        dispatch(
          sortRecordSet({
            name: rs.name,
            sortFields
          })
        );

        if (gridRef) {
          gridRef.scrollIntoView(getState().recordSet[rs.name].currentRow);
        }
      }
    ),

  onToggleGroup:
    (rs: RecordSet, rowIdx: number) => dispatch(
      toggleGroup({
        name: rs.name,
        rowIdx
      })
    )
});
