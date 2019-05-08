import {connectView} from "@src/app/components/connectView";
import {GdmnAction, gdmnActions} from "@src/app/scenes/gdmn/actions";
import {IState} from "@src/app/store/reducer";
import {rsActions, RSAction} from "gdmn-recordset";
import {TTaskStatus} from "@gdmn/server-api";
import {apiService} from "@src/app/services/apiService";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {compose} from "recompose";
import {ThunkDispatch} from "redux-thunk";
import {DlgState, SqlDataDlgView, ISqlDataDlgViewMatchParams, ISqlDataDlgViewProps} from "./SqlDataDlgView";
import { TRsMetaActions } from "@src/app/store/rsmeta";

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
    (thunkDispatch: ThunkDispatch<IState, never, GdmnAction | RSAction | TRsMetaActions>, ownProps) => ({
      setRow: (rowIndex: number) => thunkDispatch(async (dispatch, getState) => {
        const requestID = ownProps.match ? ownProps.match.params.id : "";
        const requestRecord = getState().sqlDataViewState.requests.find(itm => itm.id === requestID);

        if (!requestRecord) throw new Error("SQL request was not found"); // temporary throw error

        const rs = getState().recordSet[requestID];
        if (!rs) return;

        dispatch(rsActions.setCurrentRow({ name: rs.name, currentRow: rowIndex }));
      }),
      onView: (entityName: string, pk: string) => thunkDispatch(async (dispatch, getState) => {
        const erModel = getState().gdmnState.erModel;

        console.log(entityName, pk);
        const result = await apiService.defineEntity({
          entity: erModel.entity(entityName).name,
          pkValues: [pk]
        });

        switch (result.payload.status) {
          case TTaskStatus.SUCCESS: {
            const entity = erModel.entity(result.payload.result!.entity);
            const url = ownProps.location.pathname.replace(`sql/${ownProps.match.params.id}/view`, `entity/${entity.name}/edit/${pk}`)
            ownProps.history!.push(url);
            break;
          }
          default:
            return;
        }
      })
    })
  )
)(SqlDataDlgView);
