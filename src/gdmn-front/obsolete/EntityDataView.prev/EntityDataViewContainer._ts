import {TTaskStatus} from "@gdmn/server-api";
import {connectDataView} from "@src/app/components/connectDataView";
import {GdmnAction} from "@src/app/scenes/gdmn/actions";
import {apiService} from "@src/app/services/apiService";
import {IState} from "@src/app/store/reducer";
import {GridAction, TLoadMoreRsDataEvent} from "gdmn-grid";
import {RSAction, rsActions} from "gdmn-recordset";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {ThunkDispatch} from "redux-thunk";
import {EntityDataView} from "./EntityDataView";
import { TRsMetaActions } from "@src/app/store/rsmeta";
import { loadRSActions, LoadRSActions } from "@src/app/store/loadRSActions";
import { ParsedText, parsePhrase, RusPhrase } from 'gdmn-nlp';
import { ERTranslatorRU } from 'gdmn-nlp-agent';
import { IEntityDataViewProps, IEntityDataViewRouteProps } from "./EntityDataView.types";
import { Semaphore } from "gdmn-internals";
import { prepareDefaultEntityQuery } from "./utils";

export const EntityDataViewContainer = compose<IEntityDataViewProps, RouteComponentProps<IEntityDataViewRouteProps>>(
  connect(
    (state: IState, ownProps: RouteComponentProps<IEntityDataViewRouteProps>) => {
      const entityName = EntityDataView.getEntityNameFromProps(ownProps);
      return {
        erModel: state.gdmnState.erModel,
        data: {
          rs: state.recordSet[entityName],
          gcs: state.grid[entityName]
        }
      };
    },
    (thunkDispatch: ThunkDispatch<IState, never, GdmnAction | RSAction | GridAction | TRsMetaActions | LoadRSActions>, ownProps) => ({
      /*
      onEdit: (url: string) => thunkDispatch(async (dispatch, getState) => {
        const erModel = getState().gdmnState.erModel;
        const entityName = ownProps.match ? ownProps.match.params.entityName : "";
        const rs = getState().recordSet[entityName];
        if (!rs) return;

        const result = await apiService.defineEntity({
          entity: erModel.entity(entityName).name,
          pkValues: rs.pkValue()
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
      */

      onDelete: () => thunkDispatch(async (dispatch, getState) => {
        const entityName = ownProps.match ? ownProps.match.params.entityName : "";
        const rs = getState().recordSet[entityName];
        if (!rs) return;

        const pkValues = rs.pkValue();

        dispatch(rsActions.deleteRows({ name: rs.name }));

        const result = await apiService.delete({
          delete: {
            entity: entityName,
            pkValues
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

      attachRs: (mutex?: Semaphore, queryPhrase?: string) => thunkDispatch((dispatch, getState) => {
        const erModel = getState().gdmnState.erModel;

        if (erModel && Object.keys(erModel.entities).length) {
          const name = EntityDataView.getEntityNameFromProps(ownProps);

          if (!queryPhrase) {
            const entity = erModel.entity(name);
            const eq = prepareDefaultEntityQuery(entity);
            dispatch(loadRSActions.attachRS({ name, eq }));
          } else {
            const parsedText: ParsedText[] = parsePhrase(queryPhrase);
            if (parsedText && parsedText.some(item => !!item.phrase && item.phrase instanceof RusPhrase)) {
              const erTranslatorRU = new ERTranslatorRU(erModel)
              const command = erTranslatorRU.process(parsedText.map(item => item.phrase).reduce((phrases, item) => item ? [...phrases, item as RusPhrase] : phrases, [] as RusPhrase[]));
              const eq = command[0] ? command[0].payload : undefined;
              if (eq) {
                dispatch(loadRSActions.attachRS({ name, eq, queryPhrase, override: true }));
              }
            }
          }
        }
      }),

      loadMoreRsData: async (event: TLoadMoreRsDataEvent) => {
        const rowsCount = event.stopIndex - (event.rs ? event.rs.size : 0);
        thunkDispatch(loadRSActions.loadMoreRsData({ name: event.rs.name, rowsCount }));
      }

      /*
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
      */
    }),

    /*
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
  */
  ),
  connectDataView
)(EntityDataView);
