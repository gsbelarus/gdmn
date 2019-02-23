import { connect } from 'react-redux';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { RouteComponentProps } from 'react-router';
import { IndexRange } from 'react-virtualized';
import { compose } from 'recompose';
import { filter, first } from 'rxjs/operators';
import { Semaphore } from 'gdmn-internals';
import { BlobAttribute, EntityLink, EntityQuery, EntityQueryField, ScalarAttribute, SequenceAttribute } from 'gdmn-orm';
import {
  createRecordSet,
  IDataRow,
  RecordSet,
  RecordSetAction,
  setRecordSetData,
  addRecordSetData,
  TFieldType,
  deleteRecordSet
} from 'gdmn-recordset';
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
    ({ rsMeta, erModel, ...stateProps }, { dispatch, ...dispatchProps }, ownProps) => {
      const mergeProps = {
        erModel,
        ...stateProps,
        ...dispatchProps,

        attachRs: (mutex?: Semaphore) =>
          dispatch((dispatch, getState) => {
            console.log('createRs');
            // if (!mutex.permits) return;

            const _erModel = getState().gdmnState.erModel;

            if (!_erModel || !Object.keys(_erModel.entities).length) return;
            // console.log('createRs - 0');
            const entityName = ownProps.match ? ownProps.match.params.entityName : '';
            const entity = _erModel.entities[entityName];
            if (!entity) {
              throw new Error(`Entity ${entityName} not found in ER Model`);
            }

            const q = new EntityQuery(
              new EntityLink(
                entity,
                'z',
                Object.values(entity.attributes)
                  .filter(
                    attr =>
                      (attr instanceof ScalarAttribute || attr instanceof SequenceAttribute) &&
                      !(attr instanceof BlobAttribute)
                  )
                  .map(attr => new EntityQueryField(attr))
              )
            );

            // mutex.acquire().then(() => { // todo: ?
            apiService
              .prepareQuery({
                payload: {
                  action: TTaskActionNames.PREPARE_QUERY,
                  payload: {
                    query: q.inspect()
                  }
                }
              })
              .subscribe(value => {
                // console.log('createRs -2');
                if (value.payload.status === TTaskStatus.RUNNING) {
                  if (value.meta) {
                    // console.log('taskId', value.meta.taskId);

                    if (!value.meta.taskId) {
                      throw new Error('Task id is not set');
                    }

                    /* для корректного вызова mergeProps.loadMoreRsData */
                    rsMeta = {
                      taskId: value.meta.taskId,
                      q
                    };

                    dispatch(
                      rsMetaActions.setRsMeta(entity.name, {
                        taskId: value.meta.taskId,
                        q
                      })
                    );

                    mergeProps.loadMoreRsData({ startIndex: 0, stopIndex: 100 }); // todo calc stopIndex
                  }
                } else {
                  console.log('rs close');
                  // rsMeta = undefined;
                  // dispatch(
                  //   rsMetaActions.setRsMeta(entity.name, {
                  //     taskId: undefined
                  //   })
                  // );

                  if (getState().recordSet[entity.name]) {
                    getState().recordSet[entity.name].srcEoF = true;
                  }
                  dispatch(rsMetaActions.deleteRsMeta(entity.name));
                }
              });
            // });
          }),

        detachRs: () => {
          if (!stateProps.data || !stateProps.data.rs) return;

          dispatch(deleteRecordSet({ name: stateProps.data.rs.name }));

          if (rsMeta) {
            apiService.interruptTask({
              payload: {
                action: TTaskActionNames.INTERRUPT,
                payload: {
                  taskKey: rsMeta.taskId
                }
              }
            });
            dispatch(rsMetaActions.deleteRsMeta(stateProps.data.rs.name));
          }
        },

        loadMoreRsData: async ({ startIndex, stopIndex }: IndexRange) =>
          // dispatch((dispatch, getState)
          {
            console.log('loadMoreRsData', startIndex, stopIndex, rsMeta);

            if (!erModel || !Object.keys(erModel.entities).length) return;
            const entityName = ownProps.match ? ownProps.match.params.entityName : '';
            const entity = erModel.entities[entityName];
            if (!entity) {
              throw new Error(`Entity ${entityName} not found in ER Model`);
            }

            // const rsMeta = getState().rsMeta[entityName];
            // if (!rsMeta) {
            //   throw new Error('No rsMeta data');
            // }
            // const { taskId, q } = rsMeta;
            ////if (!rsTaskId) return;

            if (!rsMeta) return;
            if (!stateProps.data) return;
            if (!!stateProps.data.rs && ((stopIndex < stateProps.data.rs.size) || stateProps.data.rs.srcEoF)) return;

            // console.log('loadMoreRsData 2');

            let { rs, gcs } = stateProps.data;
            if (rs) {
              rs.loadingStopRowIdx = stopIndex;
            }

            const fetchRecordCount = stopIndex - (stateProps.data.rs ? stateProps.data.rs.size : 0);

            const res = await apiService
              .fetchQuery({
                payload: {
                  action: TTaskActionNames.FETCH_QUERY,
                  payload: {
                    rowsCount: fetchRecordCount,
                    taskKey: rsMeta.taskId
                  }
                }
              })
              .pipe(
                filter(value => Reflect.has(value.payload, 'result') && value.payload.status! in TTaskFinishStatus),
                first()
              )
              .toPromise();
            // .then(res => {

            console.log(res);

            if (Reflect.has(res.payload, 'result')) {
              // console.log('loadMoreRsData 3');
              if (res.error) {
                // todo
                console.log(res.error.message);
              } else if (!!res.payload.result) {
                const { q } = rsMeta;

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

                if (!rs) {
                  console.log('createWithData');

                  rs = RecordSet.createWithData(
                    entity.name,
                    fieldDefs,
                    List(res.payload.result.data as IDataRow[]),
                    undefined,
                    q
                  );
                  dispatch(createRecordSet({ name: rs.name, rs }));

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
                  console.log('addRecordSetData');

                  dispatch(
                    addRecordSetData({
                      name: rs.name,
                      records: res.payload.result.data as IDataRow[]
                    })
                  );
                }
              }
            }
          }
      };

      return mergeProps;
    }
  ),
  connectDataView
)(EntityDataView);
