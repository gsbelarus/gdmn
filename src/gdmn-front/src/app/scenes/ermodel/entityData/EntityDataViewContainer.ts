import { connect } from 'react-redux';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { RouteComponentProps } from 'react-router';
import { IndexRange } from 'react-virtualized';
import { compose } from 'recompose';
import { Semaphore } from 'gdmn-internals';
import { BlobAttribute, EntityLink, EntityQuery, EntityQueryField, ScalarAttribute, SequenceAttribute } from 'gdmn-orm';
import { addRecordSetData, createRecordSet, IDataRow, RecordSet, RecordSetAction, TFieldType, IRSSQLParams } from 'gdmn-recordset';
import { createGrid, GridAction } from 'gdmn-grid';

import { TGdmnActions } from '@src/app/scenes/gdmn/actions';
import { TTaskActionNames, TTaskStatus } from '@gdmn/server-api';
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
                if (value.payload.status === TTaskStatus.RUNNING) {
                  if (!(value.meta && value.meta.taskId)) {
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
                } else {
                  console.log('rs close');

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

          // dispatch(deleteRecordSet({ name: stateProps.data.rs.name }));
          //
          // if (rsMeta) {
          //   apiService.interruptTask({
          //     payload: {
          //       action: TTaskActionNames.INTERRUPT,
          //       payload: {
          //         taskKey: rsMeta.taskId
          //       }
          //     }
          //   });
          //   dispatch(rsMetaActions.deleteRsMeta(stateProps.data.rs.name));
          // }
        },

        loadMoreRsData: async ({ startIndex, stopIndex }: IndexRange) =>
          // dispatch((dispatch, getState)
          {
            if (!erModel || !Object.keys(erModel.entities).length) return;
            const entityName = ownProps.match ? ownProps.match.params.entityName : '';
            const entity = erModel.entities[entityName];
            if (!entity) {
              throw new Error(`Entity ${entityName} not found in ER Model`);
            }

            // if (!rsMeta) {
            //   throw new Error('No rsMeta data');
            // }
            if (!rsMeta) return;
            if (!stateProps.data) return;
            if (!!stateProps.data.rs && (stopIndex < stateProps.data.rs.size || stateProps.data.rs.srcEoF)) return;

            let { rs, gcs } = stateProps.data;
            if (rs) {
              rs.loadingStopRowIdx = stopIndex;
            }
            const fetchRecordCount = stopIndex - (stateProps.data.rs ? stateProps.data.rs.size : 0);

            console.log('fetchQuery', stopIndex - fetchRecordCount, stopIndex, rsMeta);

            const res = await apiService.fetchQuery({
              payload: {
                action: TTaskActionNames.FETCH_QUERY,
                payload: {
                  rowsCount: fetchRecordCount,
                  taskKey: rsMeta.taskId
                }
              }
            });
            // .then(res => {

            console.log(res);

            if (res.payload.status === TTaskStatus.DONE) {
              if (!res.payload.result) throw new Error('No result in query response'); // todo conditional type

              const fieldDefs = Object.entries(res.payload.result.aliases).map(([fieldAlias, data]) => {
                const attr = entity.attributes[data.attribute];
                if (!attr) {
                  throw new Error(`Unknown attribute ${data.attribute}`);
                }
                return attr2fd(rsMeta.q, fieldAlias, data);
              });

              if (!rs) {
                console.log('createWithData');

                rs = RecordSet.createWithData(
                  entity.name,
                  fieldDefs,
                  List(res.payload.result.data as IDataRow[]),
                  undefined,
                  rsMeta.q,
                  {
                    select: res.payload.result.info.select as string,
                    params: res.payload.result.info.params as IRSSQLParams
                  }
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
      };

      return mergeProps;
    }
  ),
  connectDataView
)(EntityDataView);
