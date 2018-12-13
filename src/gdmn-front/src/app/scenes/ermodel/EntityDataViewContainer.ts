import { ERModelView } from './ERModelView';
import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { ERModel } from 'gdmn-orm';
import { RecordSet, TFieldType, createRecordSet, RecordSetAction } from 'gdmn-recordset';
import { createGrid, GridAction } from 'gdmn-grid';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { connectDataViewDispatch } from '../components/connectDataView';
import { GdmnPubSubApi, GdmnPubSubError } from '@src/app/services/GdmnPubSubApi';

/*
export const getEntityDataViewContainer = (entityName: string) => connect(
  (state: IState) => ({
    data:
      {
        rs: state.recordSet[entityName],
        gcs: state.grid[entityName]
      },
    erModel: state.gdmnState.erModel
  }),

  (dispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction>) => ({
    ...connectDataViewDispatch(dispatch),
    loadData: () => {

        GdmnPubSubApi
          .getData({
            payload: {
              action: TTaskActionNames.QUERY,
              payload: action.payload
            }
          })
          .subscribe(value => {
            if (value.error) {
              dispatch(rootActions.onError(new Error(value.error.message)));
            } else if (!!value.payload.result) {
              console.log('QUERY response result: ', value.payload.result);
            }
          });

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
  })
)(EntityDataView);
*/