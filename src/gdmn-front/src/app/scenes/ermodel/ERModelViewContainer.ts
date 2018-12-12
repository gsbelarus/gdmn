import { ERModelView } from './ERModelView';
import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { ERModel } from 'gdmn-orm';
import { RecordSet, TFieldType, createRecordSet, RecordSetAction, SortFields, sortRecordSet, selectRow, setAllRowsSelected, setCurrentRow, toggleGroup } from 'gdmn-recordset';
import { createGrid, GridAction, cancelSortDialog, applySortDialog, resizeColumn, columnMove, setCursorCol, GDMNGrid } from 'gdmn-grid';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';

export const ERModelViewContainer = connect(
  (state: IState) => ({
    data:
      {
        rs: state.recordSet.entities,
        gcs: state.grid.entities,
        detail: [
          {
            rs: state.recordSet.attributes,
            gcs: state.grid.attributes
          }
        ]
      },
    erModel: state.gdmnState.erModel
  }),

  (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>) => ({

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
      ),

    loadFromERModel: (erModel: ERModel) => {
      const entitiesRS = RecordSet.createWithData(
        'entities',
        [
          {
            fieldName: 'name',
            dataType: TFieldType.String,
            size: 31,
            caption: 'Entity name'
          },
          {
            fieldName: 'description',
            dataType: TFieldType.String,
            size: 60,
            caption: 'Description'
          }
        ],
        List(
          Object.entries(erModel.entities).map(([name, ent]) => ({
            name,
            description: ent.lName.ru ? ent.lName.ru.name : name
          }))
        )
      );
      dispatch(createRecordSet({ name: entitiesRS.name, rs: entitiesRS }));

      const attributesRS = RecordSet.createWithData(
        'attributes',
        [
          {
            fieldName: 'name',
            size: 31,
            dataType: TFieldType.String,
            caption: 'Attribute name'
          },
          {
            fieldName: 'description',
            dataType: TFieldType.String,
            size: 60,
            caption: 'Description'
          }
        ],
        List(
          Object.entries(erModel.entities[entitiesRS.getString(entitiesRS.currentRow, 'name')].attributes).map(([name, ent]) => ({
            name,
            description: ent.lName.ru ? ent.lName.ru.name : name
          }))
        )
      );
      dispatch(createRecordSet({ name: attributesRS.name, rs: attributesRS }));

      dispatch(createGrid({
        name: 'entities',
        columns: entitiesRS.fieldDefs.map( fd => (
          {
            name: fd.fieldName,
            caption: [fd.caption || fd.fieldName],
            fields: [{...fd}],
            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
          })),
        leftSideColumns: 0,
        rightSideColumns: 0,
        hideFooter: true
      }));

      dispatch(createGrid({
        name: 'attributes',
        columns: entitiesRS.fieldDefs.map( fd => (
          {
            name: fd.fieldName,
            caption: [fd.caption || fd.fieldName],
            fields: [{...fd}],
            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
          })),
        leftSideColumns: 0,
        rightSideColumns: 0,
        hideFooter: true
      }));
    }
  }),

  (stateProps, dispatchProps) => {
    const { erModel } = stateProps;
    const { loadFromERModel } = dispatchProps;
    return {
      ...stateProps,
      ...dispatchProps,
      loadData: () => {
        if (erModel && Object.entries(erModel.entities).length) {
          loadFromERModel(erModel);
        }
      }
    }
  }
)(ERModelView);
