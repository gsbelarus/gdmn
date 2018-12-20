import { ERModelView } from './ERModelView';
import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { ERModel } from 'gdmn-orm';
import { RecordSet, TFieldType, createRecordSet, RecordSetAction } from 'gdmn-recordset';
import { createGrid, GridAction } from 'gdmn-grid';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { bindDataViewDispatch } from '../components/bindDataView';
import { gdmnActions, TGdmnActions } from '../gdmn/actions';

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

  (thunkDispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction | TGdmnActions>) => ({
    ...bindDataViewDispatch(thunkDispatch),
    apiGetSchema: () => thunkDispatch(gdmnActions.apiGetSchema()),
    loadFromERModel: (erModel: ERModel) => thunkDispatch( (dispatch, getState) => {
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
        ),
        [
          {
            fieldName: 'name',
            value: entitiesRS.getString(entitiesRS.currentRow, 'name')
          }
        ]
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
    })
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
