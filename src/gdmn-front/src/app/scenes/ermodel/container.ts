import { connect } from 'react-redux';
import { createRecordSet, IDataRow, RecordSet, RecordSetAction, setRecordSet, TFieldType } from 'gdmn-recordset';
import { createGrid, GridAction } from 'gdmn-grid';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { withRouter } from 'react-router';

import { IState } from '@src/app/store/reducer';
import { bindDataViewDispatch } from '@src/app/components/bindDataViewDispatch';
import { gdmnActions, TGdmnActions } from '../gdmn/actions';
import { ERModelView } from './component';

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
    erModel: state.gdmnState.erModel,
    viewTabs: state.gdmnState.viewTabs
  }),

  (thunkDispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction | TGdmnActions>) => ({
    ...bindDataViewDispatch(thunkDispatch),
    thunkDispatch,
    apiGetSchema: () => thunkDispatch(gdmnActions.apiGetSchema()),
  }),

  (stateProps, dispatchProps) => {
    const { data, erModel } = stateProps;
    const { thunkDispatch } = dispatchProps;

    return {
      ...stateProps,
      ...dispatchProps,
      loadData: () => thunkDispatch( (dispatch, getState) => {
        if (!erModel || !Object.keys(erModel.entities).length) {
          return;
        }

        let entitiesRS: RecordSet;

        if (data.rs) {
          entitiesRS = data.rs;
        } else {
          entitiesRS = RecordSet.createWithData(
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
              } as IDataRow))
            )
          );

          dispatch(createRecordSet({ name: entitiesRS.name, rs: entitiesRS }));
        }

        const currEntity = entitiesRS.getString(entitiesRS.currentRow, 'name');

        let attributesRS: RecordSet;

        if (data.detail[0] && data.detail[0].rs) {
          attributesRS = data.detail[0].rs;

          if (!attributesRS.masterLink || attributesRS.masterLink.masterName !== entitiesRS.name) {
            throw new Error(`Invalid master-detail link for entities-attributes rs`);
          }

          if (attributesRS.masterLink.values[0].value !== currEntity) {
            const data = List(
              Object.entries(erModel.entities[currEntity].attributes).map(([name, ent]) => ({
                name,
                description: ent.lName.ru ? ent.lName.ru.name : name
              } as IDataRow))
            );

            dispatch(setRecordSet({ name: 'attributes', rs: attributesRS.setData(data) }));
          }

        } else {
          attributesRS = RecordSet.createWithData(
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
              Object.entries(erModel.entities[currEntity].attributes).map(([name, ent]) => ({
                name,
                description: ent.lName.ru ? ent.lName.ru.name : name
              } as IDataRow))
            ),
            {
              masterName: entitiesRS.name,
              values: [{
                fieldName: 'name',
                value: entitiesRS.getString(entitiesRS.currentRow, 'name')
              }]
            }
          );
          dispatch(createRecordSet({ name: attributesRS.name, rs: attributesRS }));
        }

        if (!data.gcs) {
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
        }

        if (data.detail[0] && !data.detail[0].gcs) {
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
    };
  }
)(withRouter(ERModelView));
