import { GdmnPubSubApi } from "../services/GdmnPubSubApi";
import { TThunkMiddleware } from "./middlewares";
import { getType } from "typesafe-actions";
import { loadRSActions as actions, LoadRSActions } from "./loadRSActions";
import { TTaskStatus } from "@gdmn/server-api";
import { attr2fd } from "../scenes/ermodel/EntityDataView/utils";
import { RecordSet, IDataRow, TFieldType, TStatus, rsActions, TCommitResult } from "gdmn-recordset";
import { List } from "immutable";
import { createGrid } from "gdmn-grid";
import { rsMetaActions, IRsMeta } from "./rsmeta";

export const loadRsMiddleware = (apiService: GdmnPubSubApi): TThunkMiddleware => ({ dispatch, getState }) => next => async (action: LoadRSActions) => {

  if (
    action.type !== getType(actions.loadRS)
    &&
    action.type !== getType(actions.postRS)
    &&
    action.type !== getType(actions.attachRS)
    &&
    action.type !== getType(actions.loadMoreRsData)
    &&
    action.type !== getType(actions.deleteRS) )
  {
    return next(action);
  }

  const { name } = action.payload;
  const getRsMeta = () => getState().rsMeta[name];
  const setRsMeta = (rsMeta: IRsMeta) => dispatch(rsMetaActions.setRsMeta(name, rsMeta));

  switch (action.type) {
    case getType(actions.loadRS): {
      const { name, eq } = action.payload;
      apiService.query({ query: eq.inspect() })
        .then( response => {
          const result = response.payload.result!;
          const fieldDefs = Object.entries(result.aliases).map( ([fieldAlias, data]) => attr2fd(eq, fieldAlias, data.linkAlias, data.attribute) );
          const rs = RecordSet.create({
            name,
            fieldDefs,
            data: List(result.data as IDataRow[]),
            eq,
            sql: result.info
          });
          dispatch(rsActions.createRecordSet({ name, rs }));
        });

      break;
    }

    case getType(actions.postRS): {
      const { name, callback } = action.payload;
      let rs = getState().recordSet[name];
      if (rs.changed) {
        rs = rs.setLocked(true);
        dispatch(rsActions.setRecordSet(rs));

        const commitFunc = (_row: IDataRow) => {
          return new Promise( resolve => setTimeout( () => resolve(), 2000 ))
            .then( () => TCommitResult.Success );
        }

        rs = await rs.post(commitFunc, true);
        dispatch(rsActions.setRecordSet(rs));
        if (callback) {
          callback();
        }
      }
      break;
    }

    case getType(actions.attachRS): {
      const { eq, queryPhrase, override, entityMaster } = action.payload;

      const prevRsm = getRsMeta();

      if (prevRsm && prevRsm.taskKey) {
        setRsMeta({});
        const res = await apiService.interruptTask({ taskKey: prevRsm.taskKey });
        if (res.error) {
          throw new Error(`Can't interrup task. Error: ${res.error.message}`);
        }
      } else {
        setRsMeta({});
      }

      apiService
        .prepareQuery({ query: eq.inspect() })
        .subscribe(async value => {
          switch (value.payload.status) {

            case TTaskStatus.RUNNING: {
              const taskKey = value.meta!.taskKey!;

              /**
               * ViewTab could be closed before we get a response
               * from a server. Interrupt task then.
               */
              if (!getRsMeta()) {
                apiService.interruptTask({ taskKey }).catch(console.error);
                return;
              }

              setRsMeta({ taskKey });

              const response = await apiService.fetchQuery({
                rowsCount: 100,
                taskKey
              });

              const rsm = getRsMeta();

              if (!rsm) {
                apiService.interruptTask({ taskKey }).catch(console.error);
                return;
              }

              switch (response.payload.status) {

                case TTaskStatus.SUCCESS: {
                  const result = response.payload.result!;
                  const fieldDefs = Object.entries(result.aliases).map( ([fieldAlias, data]) => attr2fd(eq, fieldAlias, data.linkAlias, data.attribute) );
                  const rs = RecordSet.create({
                    name,
                    fieldDefs,
                    data: List(result.data as IDataRow[]),
                    eq,
                    queryPhrase,
                    sql: result.info,
                    sequentially: !!rsm.taskKey
                  });
                  if(!entityMaster) {
                    dispatch(rsActions.createRecordSet({ name, rs, override }))
                  
                    if (override || !getState().grid[name]) {
                      dispatch(
                        createGrid({
                          name,
                          columns: rs.fieldDefs.map(fd => ({
                            name: fd.fieldName,
                            caption: [fd.caption || fd.fieldName],
                            fields: [{...fd}],
                            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
                          })),
                          leftSideColumns: 0,
                          rightSideColumns: 0,
                          hideFooter: true,
                          override
                        })
                      );
                    }
                  } else {
                    dispatch(rsActions.createRecordSet({ name: `${name}-master`, rs, override }));
                    if (override || !getState().grid[`${name}-master`]) {
                      dispatch(
                        createGrid({
                          name: `${name}-master`,
                          columns: rs.fieldDefs.map(fd => ({
                            name: fd.fieldName,
                            caption: [fd.caption || fd.fieldName],
                            fields: [{...fd}],
                            width: fd.dataType === TFieldType.String && fd.size ? fd.size * 10 : undefined
                          })),
                          leftSideColumns: 0,
                          rightSideColumns: 0,
                          hideFooter: true,
                          override
                        })
                      );
                    }
                  }


                  break;
                }

                case TTaskStatus.FAILED: {
                  if (rsm) {
                    setRsMeta({ error: response.error ? `code: ${response.error.code}, message: ${response.error.message}` : 'Unknown task error.' });
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

            case TTaskStatus.INTERRUPTED: {
              if (getRsMeta()) {
                setRsMeta({});
              }
              break;
            }

            case TTaskStatus.FAILED: {
              if (getRsMeta()) {
                setRsMeta({ error: value.error ? `code: ${value.error.code}, message: ${value.error.message}` : 'Unknown task error.' });
              }
              break;
            }

            case TTaskStatus.SUCCESS: {
              if (getRsMeta()) {
                setRsMeta({});
              }
              break;
            }

            case TTaskStatus.PAUSED:
            default: {
              throw new Error("Unsupported");
            }
          }
        }
      );

      break;
    }

    case getType(actions.loadMoreRsData): {
      const rsm = getRsMeta();

      if (rsm) {
        if (!rsm.taskKey) {
          throw new Error(`No task key for recordset ${name}`);
        }

        dispatch(rsActions.loadingData({ name }));

        const { rowsCount } = action.payload;

        const response = await apiService.fetchQuery({
          rowsCount,
          taskKey: rsm.taskKey
        });

        const rsMeta = getRsMeta();

        if (!rsMeta) {
          apiService.interruptTask({ taskKey: rsm.taskKey }).catch(console.error);
          return;
        }

        const rs = getState().recordSet[name];

        switch (response.payload.status) {

          case TTaskStatus.SUCCESS: {
            if (rs && rs.status === TStatus.LOADING) {
              dispatch(rsActions.addData({ name, records: response.payload.result!.data, full: !(rsMeta && rsMeta.taskKey) }));
            }
            break;
          }

          case TTaskStatus.FAILED: {
            setRsMeta({ error: response.error ? `code: ${response.error.code}, message: ${response.error.message}` : 'Unknown task error.' });
            break;
          }

          case TTaskStatus.INTERRUPTED:
          case TTaskStatus.PAUSED:
          default:
            throw new Error("Never thrown");
        }
      }

      break;
    }

    case getType(actions.deleteRS): {
      const rsm = getRsMeta();

      if (rsm) {
        if (rsm.taskKey) {
          await apiService.interruptTask({ taskKey: rsm.taskKey });
        }

        dispatch(rsMetaActions.deleteRsMeta(name));
      }

      dispatch(rsActions.deleteRecordSet({ name }));

      break;
    }
  }

  return next(action);
};
