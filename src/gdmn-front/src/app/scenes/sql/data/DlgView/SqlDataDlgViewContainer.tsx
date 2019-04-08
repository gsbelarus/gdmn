import {TTaskStatus} from "@gdmn/server-api";
import {connectView} from "@src/app/components/connectView";
import {attr2fd} from "../utils";
import {TGdmnActions} from "@src/app/scenes/gdmn/actions";
import {apiService} from "@src/app/services/apiService";
import {IState, rsMetaActions, TRsMetaActions} from "@src/app/store/reducer";
import {Semaphore} from "gdmn-internals";
import {createRecordSet, IDataRow, RecordSet, RecordSetAction} from "gdmn-recordset";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {ThunkDispatch} from "redux-thunk";
import {DlgState, SqlDataDlgView, ISqlDataDlgViewMatchParams, ISqlDataDlgViewProps} from "./SqlDataDlgView";

export const SqlDataDlgViewContainer = compose<ISqlDataDlgViewProps, RouteComponentProps<any>>(
  connectView,
  connect(
    (state: IState, ownProps: RouteComponentProps<ISqlDataDlgViewMatchParams>) => {
      const { id } = ownProps.match.params;
      return {
        src: state.recordSet[id],
        rs: state.recordSet[id],
        erModel: state.gdmnState.erModel,
        dlgState: DlgState.dsEdit
      };
    },
    (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | TRsMetaActions>, ownProps) => ({
      onView: (url: string) => thunkDispatch(async (dispatch, getState) => {
        const requestID = ownProps.match ? ownProps.match.params.id : "";
        const requestRecord = getState().sqlDataViewState.requests.find(itm => itm.id === requestID);

        if (!requestRecord) throw new Error("SQL request was not found"); // temporary throw error

        const rs = getState().recordSet[requestID];
        if (!rs) return;

        ownProps.history!.push(url);
      }),
      attachRs: (mutex: Semaphore) => thunkDispatch(async (dispatch, getState) => {
        /*
        const {id : requestID, rowid} = ownProps.match.params;

        const requestRecord = getState().sqlDataViewState.requests.find(itm => itm.id === requestID);

        if (!requestRecord || !rowid) {
          throw new Error("SQL request or Row id  was not found"); // temporary throw error
        }

        const rs = getState().recordSet[requestID];
        console.log(rs);

        if (!rs) return;

        // dispatch(createRecordSet({name: rs.name, rs}));

        const {id : requestID, rowid} = ownProps.match.params;

        const requestRecord = getState().sqlDataViewState.requests.find(itm => itm.id === requestID);
        const name = `${requestID}/${rowid}`;

        if (!requestRecord || !rowid) {
          throw new Error("SQL request or Row id  was not found"); // temporary throw error
        }

        dispatch(rsMetaActions.setRsMeta(name, {}));

        if (!getState().rsMeta[name]) return;

        await mutex.acquire();
        try {
          const response = await apiService.sqlQuery({
            select: requestRecord.expression, params: []
          });

          if (!getState().rsMeta[name]) return;

          switch (response.payload.status) {
            case TTaskStatus.SUCCESS: {
              const fieldDefs = Object.entries(response.payload.result!.aliases)
              .map(([fieldAlias, data]) => attr2fd(fieldAlias, data));

              const rs = RecordSet.create({
                name: name,
                fieldDefs,
                data: List(response.payload.result!.data as IDataRow[])
              });
              dispatch(createRecordSet({name: rs.name, rs}));
            }
          }
        } finally {
          mutex.release();
        } */
      })
    })
  )
)(SqlDataDlgView);
