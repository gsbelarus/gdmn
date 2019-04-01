import {TTaskStatus} from "@gdmn/server-api";
import {ISqlDataViewProps, SqlDataView} from "@src/app/scenes/sql/data/SqlDataView";
import {createGrid, GridAction, TLoadMoreRsDataEvent} from "gdmn-grid";
import {EntityLink, EntityQuery, EntityQueryField, ScalarAttribute} from "gdmn-orm";
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
import {connectDataView} from "@src/app/components/connectDataView";
import {TGdmnActions} from "@src/app/scenes/gdmn/actions";
import {apiService} from "@src/app/services/apiService";
import {IState, rsMetaActions, TRsMetaActions} from "@src/app/store/reducer";
import {attr2fd} from "./utils";

export const SqlDataViewContainer = compose<ISqlDataViewProps, RouteComponentProps<any>>(
  connect(
    (state: IState, ownProps: Partial<ISqlDataViewProps>) => {
      const requestID = ownProps.match ?  ownProps.match.params.id : "";
      const requestRecord = state.sqlDataViewState.requests.find(itm => itm. id === requestID);

      if (!requestRecord) throw new Error('SQL request was not found'); // temporary throw error

      return {
        rsMeta: state.rsMeta[requestID],
        data: {
          rs: state.recordSet[requestID],
          gcs: state.grid[requestID]
        }
      };
    },
    (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | GridAction | TRsMetaActions>, ownProps) => ({
      attachRs: () => thunkDispatch((dispatch, getState) => {
        const requestID = ownProps.match ?  ownProps.match.params.id : "";
        const requestRecord = getState().sqlDataViewState.requests.find(itm => itm. id === requestID);

        if (!requestRecord) throw new Error('SQL request was not found'); // temporary throw error

        // запрос на бэк
        dispatch(rsMetaActions.setRsMeta(requestID, {}));

        apiService
          .prepareSqlQuery({
            select: requestRecord.expression, params: []
          })
          .subscribe(async value => {
            switch (value.payload.status) {
              case TTaskStatus.RUNNING: {
                const taskKey = value.meta!.taskKey!;

                if (!getState().rsMeta[requestID]) {
                  console.warn("ViewTab was closing, interrupt task");
                  apiService.interruptTask({taskKey}).catch(console.error);
                  return;
                }
                dispatch(rsMetaActions.setRsMeta(requestID, {taskKey}));

                apiService.fetchSqlQuery({
                  rowsCount: 100,
                  taskKey
                })
                  .then((res) => {
                    const rsm = getState().rsMeta[requestID];
                    if (!rsm) {
                      console.warn("ViewTab was closed, interrupt task");
                      apiService.interruptTask({taskKey}).catch(console.error);
                      return;
                    }
                    switch (res.payload.status) {
                      case TTaskStatus.SUCCESS: {
                        const fieldDefs = Object.entries(res.payload.result!.aliases)
                          .map(([fieldAlias, data]) => attr2fd(fieldAlias, data));

                        const rs = RecordSet.create({
                          name: requestID,
                          fieldDefs,
                          data: List(res.payload.result!.data as IDataRow[]),
                          sequentially: !!rsm.taskKey
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
                          dispatch(rsMetaActions.setRsMeta(requestID, {}));
                        }
                        break;
                      }
                      case TTaskStatus.INTERRUPTED:
                      case TTaskStatus.PAUSED:
                      default:
                        throw new Error("Never thrown");
                    }
                  });
                break;
              }
              case TTaskStatus.INTERRUPTED:
              case TTaskStatus.FAILED: {
                if (getState().rsMeta[requestID]) {
                  dispatch(rsMetaActions.setRsMeta(requestID, {}));
                }
                break;
              }
              case TTaskStatus.SUCCESS: {
                if (getState().rsMeta[requestID]) {
                  dispatch(rsMetaActions.setRsMeta(requestID, {}));
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
      loadingData: (name: string) => thunkDispatch(loadingData({name})),
      addData: (name: string, records: IDataRow[]) => thunkDispatch(
        (dispatch, getState) => {
          const rsm = getState().rsMeta[name];
          const rs = getState().recordSet[name];
          if (rs && rs.status === TStatus.LOADING) {
            dispatch(addData({name, records, full: !(rsm && rsm.taskKey)}));
          }
        }),
      setError: (name: string, error: IError) => thunkDispatch(
        (dispatch, getState) => {
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

        loadingData(event.rs.name);
        const res = await apiService.fetchSqlQuery({
          rowsCount: fetchRecordCount,
          taskKey: rsMeta.taskKey!
        });
        switch (res.payload.status) {
          case TTaskStatus.SUCCESS: {
            addData(event.rs.name, res.payload.result!.data);
            break;
          }
          case TTaskStatus.FAILED: {
            setError(event.rs.name, {message: res.error!.message});
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
)(SqlDataView);
