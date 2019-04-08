import {TTaskStatus} from "@gdmn/server-api";
import {connectDataView} from "@src/app/components/connectDataView";
import {TGdmnActions} from "@src/app/scenes/gdmn/actions";
import {apiService} from "@src/app/services/apiService";
import {IState, rsMetaActions, TRsMetaActions} from "@src/app/store/reducer";
import {createGrid, GridAction, TLoadMoreRsDataEvent} from "gdmn-grid";
import {
  addData,
  createRecordSet,
  IDataRow,
  IError,
  loadingData,
  RecordSet,
  RecordSetAction,
  setError,
  TFieldType,
  TStatus
} from "gdmn-recordset";
import {List} from "immutable";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {ThunkDispatch} from "redux-thunk";
import {EntityDataView, IEntityDataViewProps} from "./EntityDataView";
import {attr2fd, prepareDefaultEntityQuery} from "./utils";

export const EntityDataViewContainer = compose<IEntityDataViewProps, RouteComponentProps<any>>(
  connect(
    (state: IState, ownProps: Partial<IEntityDataViewProps>) => {
      const entityName = ownProps.match ? ownProps.match.params.entityName : "";
      return {
        rsMeta: state.rsMeta[entityName],
        erModel: state.gdmnState.erModel,
        data: {
          rs: state.recordSet[entityName],
          gcs: state.grid[entityName]
        }
      };
    },
    (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | GridAction | TRsMetaActions>, ownProps) => ({
      onEdit: (url: string) => thunkDispatch(async (dispatch, getState) => {
        const erModel = getState().gdmnState.erModel;
        const entityName = ownProps.match ? ownProps.match.params.entityName : "";
        const rs = getState().recordSet[entityName];
        if (!rs) return;

        const result = await apiService.defineEntity({
          entity: erModel.entity(entityName).name,
          pkValues: rs.pk2s
        });
        switch (result.payload.status) {
          case TTaskStatus.SUCCESS: {
            const entity = erModel.entity(result.payload.result!.entity);
            if (entityName !== entity.name) {
              ownProps.history!.push(url.replace(entityName, entity.name));
            } else {
              ownProps.history!.push(url);
            }
            break;
          }
          default:
            return;
        }
      }),
      onDelete: () => thunkDispatch(async (dispatch, getState) => {
        const entityName = ownProps.match ? ownProps.match.params.entityName : "";
        const rs = getState().recordSet[entityName];
        if (!rs) return;

        const result = await apiService.delete({
          delete: {
            entity: entityName,
            pkValues: rs.pk2s
          }
        });
        switch (result.payload.status) {
          case TTaskStatus.SUCCESS: {
            // TODO
            alert("Successful, please update RecordSet (tmp)");
            break;
          }
          default:
            return;
        }
      }),
      attachRs: () => thunkDispatch((dispatch, getState) => {
        const erModel = getState().gdmnState.erModel;

        if (!erModel || !Object.keys(erModel.entities).length) return;
        const entityName = ownProps.match ? ownProps.match.params.entityName : "";
        const entity = erModel.entity(entityName);

        const query = prepareDefaultEntityQuery(entity);

        dispatch(rsMetaActions.setRsMeta(entity.name, {}));

        apiService
          .prepareQuery({
            query: query.inspect()
          })
          .subscribe(async value => {
            switch (value.payload.status) {
              case TTaskStatus.RUNNING: {
                const taskKey = value.meta!.taskKey!;

                if (!getState().rsMeta[entity.name]) {
                  console.warn("ViewTab was closing, interrupt task");
                  apiService.interruptTask({taskKey}).catch(console.error);
                  return;
                }
                dispatch(rsMetaActions.setRsMeta(entity.name, {taskKey}));

                const response = await apiService.fetchQuery({
                  rowsCount: 100,
                  taskKey
                });

                const rsm = getState().rsMeta[entity.name];
                if (!rsm) {
                  console.warn("ViewTab was closed, interrupt task");
                  apiService.interruptTask({taskKey}).catch(console.error);
                  return;
                }

                switch (response.payload.status) {
                  case TTaskStatus.SUCCESS: {
                    const fieldDefs = Object.entries(response.payload.result!.aliases)
                      .map(([fieldAlias, data]) => attr2fd(query, fieldAlias, data));

                    const rs = RecordSet.create({
                      name: entity.name,
                      fieldDefs,
                      data: List(response.payload.result!.data as IDataRow[]),
                      eq: query,
                      sequentially: !!rsm.taskKey,
                      sql: response.payload.result!.info
                    });
                    dispatch(createRecordSet({name: rs.name, rs}));

                    if (!getState().grid[rs.name]) {
                      dispatch(
                        createGrid({
                          name: rs.name,
                          columns: rs.fieldDefs.map(fd => ({
                            name: fd.fieldName,
                            caption: [fd.caption || fd.fieldName],
                            fields: [{...fd}],
                            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
                          })),
                          leftSideColumns: 0,
                          rightSideColumns: 0,
                          hideFooter: true
                        })
                      );
                    }
                    break;
                  }
                  case TTaskStatus.FAILED: {
                    if (rsm) {
                      dispatch(rsMetaActions.setRsMeta(entity.name, {}));
                    }
                    break;
                  }
                  case TTaskStatus.INTERRUPTED:
                  case TTaskStatus.PAUSED:
                  default:
                    throw new Error("Never thrown");
                }
                break;
              }
              case TTaskStatus.INTERRUPTED:
              case TTaskStatus.FAILED: {
                if (getState().rsMeta[entity.name]) {
                  dispatch(rsMetaActions.setRsMeta(entity.name, {}));
                }
                break;
              }
              case TTaskStatus.SUCCESS: {
                if (getState().rsMeta[entity.name]) {
                  dispatch(rsMetaActions.setRsMeta(entity.name, {}));
                }
                break;
              }
              case TTaskStatus.PAUSED:
              default: {
                throw new Error("Unsupported");
              }
            }
          });
      }),
      loadingData: (name: string, taskKey: string) => thunkDispatch(
        (dispatch, getState) => {
          const rsm = getState().rsMeta[name];
          if (!rsm) {
            console.warn("ViewTab was closing, interrupt task");
            apiService.interruptTask({taskKey}).catch(console.error);
            return;
          }
          dispatch(loadingData({name}));
        }
      ),
      addData: (name: string, records: IDataRow[], taskKey: string) => thunkDispatch(
        (dispatch, getState) => {
          const rsm = getState().rsMeta[name];
          if (!rsm) {
            console.warn("ViewTab was closing, interrupt task");
            apiService.interruptTask({taskKey}).catch(console.error);
            return;
          }
          const rs = getState().recordSet[name];
          if (rs && rs.status === TStatus.LOADING) {
            dispatch(addData({name, records, full: !(rsm && rsm.taskKey)}));
          }
        }),
      setError: (name: string, error: IError, taskKey: string) => thunkDispatch(
        (dispatch, getState) => {
          const rsm = getState().rsMeta[name];
          if (!rsm) {
            console.warn("ViewTab was closing, interrupt task");
            apiService.interruptTask({taskKey}).catch(console.error);
            return;
          }
          const rs = getState().recordSet[name];
          if (rs && rs.status === TStatus.LOADING) {
            dispatch(setError({name, error}));
          }
        })
    }),
    ({rsMeta, ...stateProps}, {loadingData, addData, setError, ...dispatchProps}) => ({
      ...stateProps,
      ...dispatchProps,

      loadMoreRsData: async (event: TLoadMoreRsDataEvent) => {
        const fetchRecordCount = event.stopIndex - (event.rs ? event.rs.size : 0);

        loadingData(event.rs.name, rsMeta.taskKey!);

        const res = await apiService.fetchQuery({
          rowsCount: fetchRecordCount,
          taskKey: rsMeta.taskKey!
        });

        switch (res.payload.status) {
          case TTaskStatus.SUCCESS: {
            addData(event.rs.name, res.payload.result!.data, rsMeta.taskKey!);
            break;
          }
          case TTaskStatus.FAILED: {
            setError(event.rs.name, {message: res.error!.message}, rsMeta.taskKey!);
            break;
          }
          case TTaskStatus.INTERRUPTED:
          case TTaskStatus.PAUSED:
          default:
            throw new Error("Never thrown");
        }
      }
    })
  ),
  connectDataView
)(EntityDataView);
