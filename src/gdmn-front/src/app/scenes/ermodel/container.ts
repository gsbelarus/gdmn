import { connect } from 'react-redux';
import { RecordSet, TFieldType, createRecordSet, RecordSetAction, IDataRow, setRecordSet } from 'gdmn-recordset';
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
    apiGetSchema: () => thunkDispatch(gdmnActions.apiGetSchema()),
    loadData: () => thunkDispatch( (dispatch, getState) => {
      const erModel = getState().gdmnState.erModel;

      if (!erModel || !Object.keys(erModel.entities).length) {
        return;
      }

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
          } as IDataRow))
        )
      );

      entitiesRS.asObservable.subscribe(
        e => {
          if (e.event === 'AfterScroll') {
            const attributesRS = getState().recordSet['attributes'];

            if (attributesRS) {
              const data = List(
                Object.entries(erModel.entities[e.rs.getString(e.rs.currentRow, 'name')].attributes).map(([name, ent]) => ({
                  name,
                  description: ent.lName.ru ? ent.lName.ru.name : name
                } as IDataRow))
              );

              dispatch(setRecordSet({ name: 'attributes', rs: attributesRS.setData(data) }));
            }
          }
        }
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
          } as IDataRow))
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
    })
  })
)(withRouter(ERModelView));
