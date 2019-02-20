import { connect } from 'react-redux';
import { createRecordSet, IDataRow, RecordSet, RecordSetAction, setRecordSet, TFieldType } from 'gdmn-recordset';
import { createGrid, GridAction } from 'gdmn-grid';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { RouteComponentProps } from 'react-router';

import { IState } from '@src/app/store/reducer';
import { gdmnActionsAsync, TGdmnActions } from '../gdmn/actions';
import { ERModelView } from './component';
import { Semaphore } from 'gdmn-internals';
import { compose } from 'recompose';
import { connectDataView } from '@src/app/components/connectDataView';

export const ERModelViewContainer = compose<any, RouteComponentProps<any>>(
  connect(
    (state: IState) => ({
      data: {
        rs: state.recordSet.entities,
        gcs: state.grid.entities,
        detail: [
          {
            rs: state.recordSet.attributes,
            gcs: state.grid.attributes
          }
        ]
      }
    }),

    (thunkDispatch: ThunkDispatch<IState, never, GridAction | RecordSetAction | TGdmnActions>) => ({
      loadMoreRsData: undefined,
      createRs: (_mutex: Semaphore) =>
        thunkDispatch((dispatch, getState) => {
          const erModel = getState().gdmnState.erModel;

          if (!erModel || !Object.keys(erModel.entities).length) {
            return;
          }

          let entitiesRS = getState().recordSet.entities;

          if (!entitiesRS) {
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
                Object.entries(erModel.entities).map(
                  ([name, ent]) =>
                    ({
                      name,
                      description: ent.lName.ru ? ent.lName.ru.name : name
                    } as IDataRow)
                )
              )
            );

            dispatch(createRecordSet({ name: entitiesRS.name, rs: entitiesRS }));
          }

          const currEntity = entitiesRS.getString(entitiesRS.currentRow, 'name');

          let attributesRS = getState().recordSet.attributes;

          if (attributesRS) {
            if (!attributesRS.masterLink || attributesRS.masterLink.masterName !== entitiesRS.name) {
              throw new Error(`Invalid master-detail link for entities-attributes rs`);
            }

            if (attributesRS.masterLink.values[0].value !== currEntity) {
              const data = List(
                Object.entries(erModel.entities[currEntity].attributes).map(
                  ([name, ent]) =>
                    ({
                      name,
                      description: ent.lName.ru ? ent.lName.ru.name : name
                    } as IDataRow)
                )
              );

              dispatch(
                setRecordSet({
                  name: attributesRS.name,
                  rs: attributesRS.setData(data, {
                    masterName: entitiesRS.name,
                    values: [
                      {
                        fieldName: 'name',
                        value: currEntity
                      }
                    ]
                  })
                })
              );
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
                Object.entries(erModel.entities[currEntity].attributes).map(
                  ([name, ent]) =>
                    ({
                      name,
                      description: ent.lName.ru ? ent.lName.ru.name : name
                    } as IDataRow)
                )
              ),
              {
                masterName: entitiesRS.name,
                values: [
                  {
                    fieldName: 'name',
                    value: currEntity
                  }
                ]
              }
            );
            dispatch(createRecordSet({ name: attributesRS.name, rs: attributesRS }));
          }

          const gcs = getState().grid.entities;

          if (!gcs) {
            dispatch(
              createGrid({
                name: 'entities',
                columns: entitiesRS.fieldDefs.map(fd => ({
                  name: fd.fieldName,
                  caption: [fd.caption || fd.fieldName],
                  fields: [{ ...fd }],
                  width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
                })),
                leftSideColumns: 0,
                rightSideColumns: 0,
                hideFooter: true
              })
            );
          }

          const gcsAttributes = getState().grid.attributes;

          if (!gcsAttributes) {
            dispatch(
              createGrid({
                name: 'attributes',
                columns: entitiesRS.fieldDefs.map(fd => ({
                  name: fd.fieldName,
                  caption: [fd.caption || fd.fieldName],
                  fields: [{ ...fd }],
                  width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
                })),
                leftSideColumns: 0,
                rightSideColumns: 0,
                hideFooter: true
              })
            );
          }
        }),
      apiGetSchema: () => thunkDispatch(gdmnActionsAsync.apiGetSchema())
    })
  ),
  connectDataView
)(ERModelView);
