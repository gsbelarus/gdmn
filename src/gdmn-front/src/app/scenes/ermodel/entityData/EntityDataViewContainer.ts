import { connect } from 'react-redux';
import { List } from 'immutable';
import { ThunkDispatch } from 'redux-thunk';
import { RouteComponentProps } from 'react-router';
import { IndexRange } from 'react-virtualized';
import { compose } from 'recompose';
import { filter, first } from 'rxjs/operators';
import { Semaphore } from 'gdmn-internals';
import { BlobAttribute, EntityLink, EntityQuery, EntityQueryField, ScalarAttribute } from 'gdmn-orm';
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
  connectDataView,
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
    (
      thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | GridAction | TRsMetaActions>,
      ownProps: Partial<IEntityDataViewProps>
    ) => ({
      dispatch: thunkDispatch
    }),
    ({ rsMeta, erModel, ...stateProps }, { dispatch, ...dispatchProps }, ownProps) => {
      if (!erModel || !Object.keys(erModel.entities).length) return;

      const entityName = ownProps.match ? ownProps.match.params.entityName : '';
      const entity = erModel.entities[entityName];
      if (!entity) {
        throw new Error(`Entity ${entityName} not found in ER Model`);
      }

      let rsTaskId: string | undefined = rsMeta ? rsMeta.taskId : undefined;

      const mergeProps = {
        ...stateProps,
        ...dispatchProps,

        createRs: (mutex: Semaphore) =>
          dispatch((dispatch, getState) => {
            if (!mutex.permits) return;
            console.log('createRs');

            const q = new EntityQuery(
              new EntityLink(
                entity,
                'z',
                Object.values(entity.attributes)
                  .filter(attr => attr instanceof ScalarAttribute && !(attr instanceof BlobAttribute))
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

                    rsTaskId = value.meta.taskId;

                    dispatch(
                      rsMetaActions.setRsMeta(entity.name, {
                        taskId: value.meta.taskId
                      })
                    );

                    // setTimeout - workaround
                    window.setTimeout(() => mergeProps.loadMoreRsData({ startIndex: 0, stopIndex: 1 }), 2000); // todo calc stopIndex
                  }
                } else {
                  //rsTaskId = undefined;

                  dispatch(
                    rsMetaActions.setRsMeta(entity.name, {
                      taskId: undefined
                    })
                  );
                }
              });
            // });
          }),

        loadMoreRsData: async ({ startIndex, stopIndex }: IndexRange) => {
          console.log('loadMoreRsData 1', startIndex, stopIndex, rsTaskId, rsMeta);

          if (!rsTaskId) return;
          if (!stateProps.data) return;
          if (!!stateProps.data.rs && stopIndex < stateProps.data.rs.size) return;

          console.log('loadMoreRsData 2', rsTaskId);

          const fetchRecordCount = stopIndex - (stateProps.data.rs ? stateProps.data.rs.size : 0);

          const res = await apiService
            .getNextData({
              payload: {
                action: TTaskActionNames.FETCH_QUERY,
                payload: {
                  rowsCount: fetchRecordCount,
                  taskKey: rsTaskId
                }
              }
            })
            .pipe(
              filter(value => Reflect.has(value.payload, 'result') && value.payload.status! in TTaskFinishStatus),
              first()
            )
            .toPromise();

          console.log(res);

          if (Reflect.has(res.payload, 'result')) {
            console.log('loadMoreRsData 3');
            if (res.error) {
              // todo
              console.log(res.error.message);
            } else if (!!res.payload.result) {
              const fieldDefs = Object.entries(res.payload.result.aliases).map(([fieldAlias, data]) => {
                const attr = entity.attributes[data.attribute];
                if (!attr) {
                  throw new Error(`Unknown attribute ${data.attribute}`);
                }
                return attr2fd(fieldAlias, entity, attr);
              });

              let { rs, gcs } = stateProps.data;
              if (!rs) {
                console.log('createWithData');

                rs = RecordSet.createWithData(entity.name, fieldDefs, List(res.payload.result.data as IDataRow[]));
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
      };

      return mergeProps;
    }
  )
)(EntityDataView);
