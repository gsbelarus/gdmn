import { connect } from 'react-redux';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { RouteComponentProps } from 'react-router';
import { IndexRange } from 'react-virtualized';
import { compose } from 'recompose';
import { filter, first } from 'rxjs/operators';
import { Semaphore } from 'gdmn-internals';
import { BlobAttribute, EntityLink, EntityQuery, EntityQueryField, ScalarAttribute, SequenceAttribute } from 'gdmn-orm';
import { createRecordSet, IDataRow, RecordSet, RecordSetAction, setRecordSetData, TFieldType } from 'gdmn-recordset';
import { createGrid, GridAction } from 'gdmn-grid';

import { TGdmnActions } from '@src/app/scenes/gdmn/actions';
import { TTaskActionNames, TTaskFinishStatus, TTaskStatus } from '@gdmn/server-api';
import { connectDataView } from '@src/app/components/connectDataView';
import { IState, rsMetaActions, TRsMetaActions } from '@src/app/store/reducer';
import { apiService } from '@src/app/services/apiService';
import { EntityDataView, IEntityDataViewProps, IEntityMatchParams } from './EntityDataView';
import { attr2fd } from './utils';

export const EntityDataViewContainer = compose<any, RouteComponentProps<IEntityMatchParams>>(
  connect(
    (state: IState, ownProps: Partial<IEntityDataViewProps>) => {
      const entityName = ownProps.match ? ownProps.match.params.entityName : '';
      return {
        rsMeta: state.rsMeta[entityName],
        erModel: state.gdmnState.erModel,
        data: {
          rs: state.recordSet[entityName],
          gcs: state.grid[entityName]
        }
      };
    },
    (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | GridAction | TRsMetaActions>) => ({
      dispatch: thunkDispatch
    }),
    (stateProps, dispatchProps, ownProps) => {
      const { erModel } = stateProps;
      const { dispatch } = dispatchProps;

      if (!erModel || !Object.keys(erModel.entities).length) return;

      const entityName = ownProps.match ? ownProps.match.params.entityName : '';
      const entity = erModel.entities[entityName];
      if (!entity) {
        throw new Error(`Entity ${entityName} not found in ER Model`);
      }

      const mergeProps = {
        ...stateProps,
        ...dispatchProps,

        createRs: (mutex: Semaphore) =>
          dispatch((dispatch, _getState) => {
            if (!mutex.permits) return;
            console.log('createRs');

            const q = new EntityQuery(
              new EntityLink(
                entity,
                'z',
                Object.values(entity.attributes)
                  .filter(attr => ((attr instanceof ScalarAttribute) || (attr instanceof SequenceAttribute)) && !(attr instanceof BlobAttribute) )
                  .map(attr => new EntityQueryField(attr))
              )
            );

            // mutex.acquire().then(() => { // todo: ?
            apiService
              .makeDataCursor({
                payload: {
                  action: TTaskActionNames.QUERY,
                  payload: {
                    sequentially: true,
                    query: q.inspect()
                  }
                }
              })
              .subscribe(value => {
                if (value.payload.status === TTaskStatus.RUNNING) {
                  if (value.meta) {
                    console.log('taskId', value.meta.taskId);

                    if (!value.meta.taskId) {
                      throw new Error('Task id is not set');
                    }

                    dispatch(
                      rsMetaActions.setRsMeta(entity.name, {
                        taskId: value.meta.taskId,
                        q
                      })
                    );

                    // setTimeout - workaround
                    window.setTimeout(() => mergeProps.loadMoreRsData({ startIndex: 0, stopIndex: 1 }), 2000); // todo calc stopIndex
                  }
                } else {
                  //rsTaskId = undefined;

                  dispatch(rsMetaActions.deleteRsMeta(entity.name));
                }
              });
            // });
          }),

        loadMoreRsData: async ({ startIndex, stopIndex }: IndexRange) =>
          dispatch((dispatch, getState) => {
            const rsMeta = getState().rsMeta[entityName];

            if (!rsMeta) {
              throw new Error('No rsMeta data');
            }

            const { taskId, q } = rsMeta;

            console.log('loadMoreRsData 1', startIndex, stopIndex, taskId, rsMeta);

            //if (!rsTaskId) return;
            if (!stateProps.data) return;
            if (!!stateProps.data.rs && stopIndex < stateProps.data.rs.size) return;

            console.log('loadMoreRsData 2', taskId);

            const fetchRecordCount = stopIndex - (stateProps.data.rs ? stateProps.data.rs.size : 0);

            apiService
              .getNextData({
                payload: {
                  action: TTaskActionNames.FETCH_QUERY,
                  payload: {
                    rowsCount: fetchRecordCount,
                    taskKey: taskId
                  }
                }
              })
              .pipe(
                filter(value => Reflect.has(value.payload, 'result') && value.payload.status! in TTaskFinishStatus),
                first()
              )
              .toPromise()
              .then(res => {
                console.log(res);

                if (Reflect.has(res.payload, 'result')) {
                  console.log('loadMoreRsData 3');
                  if (res.error) {
                    // todo
                    console.log(res.error.message);
                  } else if (!!res.payload.result) {
                    if (!q) {
                      throw new Error(`EntityQuery not found in rsMeta`);
                    }

                    const fieldDefs = Object.entries(res.payload.result.aliases).map(([fieldAlias, data]) => {
                      const attr = entity.attributes[data.attribute];
                      if (!attr) {
                        throw new Error(`Unknown attribute ${data.attribute}`);
                      }
                      return attr2fd(q!, fieldAlias, data);
                    });

                    let { rs, gcs } = stateProps.data;
                    if (!rs) {
                      console.log('createWithData');

                      rs = RecordSet.createWithData(
                        entity.name,
                        fieldDefs,
                        List(res.payload.result.data as IDataRow[]),
                        undefined,
                        q
                      );

                      dispatch(createRecordSet({
                        name: rs.name,
                        rs
                      }));

                      if (!gcs) {
                        dispatch(
                          createGrid({
                            name: rs.name,
                            columns: rs.fieldDefs.map(fd => ({
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
                    } else {
                      console.log('setRecordSetData');

                      dispatch(
                        setRecordSetData({
                          name: rs.name,
                          data: rs.params.data.push(...(res.payload.result.data as IDataRow[])) // todo insert [startIndex]
                        })
                      );
                    }
                  }
                }
              }
            );
          }
        )
      };

      return mergeProps;
    }
  ),
  connectDataView
)(EntityDataView);
