import {TTaskStatus, ISqlQueryResponseAliasesRdb, ISqlQueryResponseAliases} from "@gdmn/server-api";
import {connectView} from "@src/app/components/connectView";
import {TGdmnActions, gdmnActions} from "@src/app/scenes/gdmn/actions";
import {apiService} from "@src/app/services/apiService";
import {IState, rsMetaActions, TRsMetaActions} from "@src/app/store/reducer";
import {Semaphore} from "gdmn-internals";
import {createRecordSet, IDataRow, RecordSet, RecordSetAction, setCurrentRow} from "gdmn-recordset";
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
        dlgState: DlgState.dsBrowse
      };
    },
    (thunkDispatch: ThunkDispatch<IState, never, TGdmnActions | RecordSetAction | TRsMetaActions>, ownProps) => ({
      setRow: (rowIndex: number) => thunkDispatch(async (dispatch, getState) => {
        const requestID = ownProps.match ? ownProps.match.params.id : "";
        const requestRecord = getState().sqlDataViewState.requests.find(itm => itm.id === requestID);

        if (!requestRecord) throw new Error("SQL request was not found"); // temporary throw error

        const rs = getState().recordSet[requestID];
        if (!rs) return;

        dispatch(setCurrentRow({ name: rs.name, currentRow: rowIndex }));
      })
    })
  )
)(SqlDataDlgView);
