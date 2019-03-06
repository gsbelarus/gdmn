import {TTaskStatus} from "@gdmn/server-api";
import {connectDataView} from "@src/app/components/connectDataView";
import {TGdmnActions} from "@src/app/scenes/gdmn/actions";
import {apiService} from "@src/app/services/apiService";
import {IState, rsMetaActions, TRsMetaActions} from "@src/app/store/reducer";
import {createGrid, GridAction, TLoadMoreRsDataEvent} from "gdmn-grid";
import {BlobAttribute, EntityLink, EntityQuery, EntityQueryField, ScalarAttribute, SequenceAttribute} from "gdmn-orm";
import {
  addData,
  createRecordSet,
  IDataRow,
  loadingData,
  RecordSet,
  RecordSetAction,
  setData,
  setError,
  TFieldType,
  TStatus
} from "gdmn-recordset";
import {List} from "immutable";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {IndexRange} from "react-virtualized";
import {compose} from "recompose";
import {ThunkDispatch} from "redux-thunk";
import {EntityDataView, IEntityDataViewProps} from "./EntityDataView";
import {attr2fd} from "./utils";

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
    (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | GridAction | TRsMetaActions>) => ({
      dispatch: thunkDispatch
    }),
    ({rsMeta, ...stateProps}, {dispatch, ...dispatchProps}, ownProps) => {
      const mergeProps = {
        ...stateProps,
        ...dispatchProps,

        attachRs: () => dispatch((dispatch, getState) => {
          const erModel = getState().gdmnState.erModel;

          if (!erModel || !Object.keys(erModel.entities).length) return;
          const entityName = ownProps.match ? ownProps.match.params.entityName : "";
          const entity = erModel.entity(entityName);

          const query = new EntityQuery(
            new EntityLink(
              entity,
              "z",
              Object.values(entity.attributes)
                .filter(
                  attr =>
                    (attr instanceof ScalarAttribute || attr instanceof SequenceAttribute) &&
                    !(attr instanceof BlobAttribute)
                )
                .map(attr => new EntityQueryField(attr)
                  /*{
                    if (attr instanceof EntityAttribute) {

                      return new EntityQueryField(attr, new EntityLink(
                        attr.e
                      ))
                    } else {
                      return new EntityQueryField(attr)
                    }*/
                )
            )
          );

          const rs = RecordSet.create({
            name: entity.name,
            fieldDefs: [],
            data: List([] as IDataRow[]),
            eq: query,
            sequentially: true
          });
          dispatch(createRecordSet({name: rs.name, rs}));
          dispatch(loadingData({name: rs.name}));

          apiService
            .prepareQuery({
              query: query.inspect()
            })
            .subscribe(value => {
              switch (value.payload.status) {
                case TTaskStatus.RUNNING: {
                  const taskKey = value.meta!.taskKey!;

                  if (getState().recordSet[entity.name]) {
                    dispatch(rsMetaActions.setRsMeta(entity.name, {taskKey}));

                    apiService.fetchQuery({
                      rowsCount: 100,
                      taskKey
                    })
                      .then((res) => {
                        const emptyRs = getState().recordSet[entity.name];
                        if (emptyRs) {
                          switch (res.payload.status) {
                            case TTaskStatus.SUCCESS: {
                              const fieldDefs = Object.entries(res.payload.result!.aliases)
                                .map(([fieldAlias, data]) => attr2fd(query, fieldAlias, data));

                              dispatch(setData({
                                name: emptyRs.name,
                                data: List([] as IDataRow[]),
                                fieldDefs,
                                sql: res.payload.result!.info
                              }));
                              const rs = getState().recordSet[emptyRs.name];

                              dispatch(
                                addData({
                                  name: rs.name,
                                  records: res.payload.result!.data as IDataRow[],
                                  full: res.payload.result!.finished
                                })
                              );

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
                              break;
                            }
                            case TTaskStatus.FAILED: {
                              dispatch(setError({name: emptyRs.name, error: {message: res.error!.message}}));
                              break;
                            }
                            case TTaskStatus.INTERRUPTED:
                            case TTaskStatus.PAUSED:
                            default:
                              throw new Error("Never thrown");
                          }
                        } else {
                          // viewTabs is closed; interrupt task
                          apiService.interruptTask({taskKey}).catch(console.error);
                        }
                      });
                  } else {
                    // viewTabs is closed; interrupt task
                    apiService.interruptTask({taskKey}).catch(console.error);
                  }
                  break;
                }
                case TTaskStatus.INTERRUPTED:
                case TTaskStatus.FAILED: {
                  dispatch(rsMetaActions.deleteRsMeta(entity.name));
                  const rs = getState().recordSet[entity.name];
                  if (rs) {
                    if (rs.status !== TStatus.LOADING) {
                      dispatch(loadingData({name: rs.name}));
                    }
                    dispatch(
                      setError({
                        name: entity.name,
                        error: {message: value.error ? value.error.message : "Interrupted"}
                      })
                    );
                  }
                  break;
                }
                case TTaskStatus.SUCCESS: {
                  dispatch(rsMetaActions.deleteRsMeta(entity.name));
                  break;
                }
                case TTaskStatus.PAUSED:
                default: {
                  throw new Error("Unsupported");
                }
              }
            });
        }),

        loadMoreRsData: async (event: TLoadMoreRsDataEvent) => {
          if (!rsMeta) {
            return;
          }
          const fetchRecordCount = event.stopIndex - (event.rs ? event.rs.size : 0);

          dispatch(loadingData({name: event.rs.name}));
          const res = await apiService.fetchQuery({
            rowsCount: fetchRecordCount,
            taskKey: rsMeta.taskKey
          });
          switch (res.payload.status) {
            case TTaskStatus.SUCCESS: {
              dispatch(
                addData({
                  name: event.rs.name,
                  records: res.payload.result!.data as IDataRow[],
                  full: res.payload.result!.finished
                })
              );
              break;
            }
            case TTaskStatus.FAILED: {
              // error can come from PREPARE_QUERY cmd
              if (stateProps.data.rs.status !== TStatus.ERROR) {
                dispatch(
                  setError({
                    name: event.rs.name,
                    error: {message: res.error!.message}
                  })
                );
              }
              break;
            }
            case TTaskStatus.INTERRUPTED:
            case TTaskStatus.PAUSED:
            default:
              throw new Error("Never thrown");
          }
        }
      };

      return mergeProps;
    }
  ),
  connectDataView
)(EntityDataView);
