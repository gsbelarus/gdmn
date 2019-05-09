import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { EntityDataDlg } from "./EntityDataDlg";
import { IEntityDataDlgStateProps, IEntityDataDlgContainerProps, IEntityDataDlgProps } from "./EntityDataDlg.types";
import { ThunkDispatch } from "redux-thunk";
import { GdmnAction, gdmnActions } from "../../gdmn/actions";
import { IViewTab } from "../../gdmn/types";
import { prepareDefaultEntityQuery } from "../entityData/utils";
import { loadRSActions, LoadRSActions } from "@src/app/store/loadRSActions";
import { rsActions, RSAction } from "gdmn-recordset";

export const EntityDataDlgContainer = connect(
  (state: IState, ownProps: IEntityDataDlgContainerProps): IEntityDataDlgStateProps => ({
    rs: state.recordSet[ownProps.url],
    entity: state.gdmnState.erModel.entities[ownProps.entityName]
  }),
  (dispatch: ThunkDispatch<IState, never, GdmnAction | LoadRSActions | RSAction>, ownProps) => ({
    dispatch,
    addViewTab: (viewTab: IViewTab) => dispatch(gdmnActions.addViewTab(viewTab)),
    closeTab: () => dispatch(gdmnActions.deleteViewTab({
        viewTabURL: ownProps.url,
        locationPath: location.pathname,
        historyPush: ownProps.history.push
      })
    ),
    cancel: () => dispatch(rsActions.cancel({ name: ownProps.url }))
  }),
  (stateProps, dispatchProps, ownProps): IEntityDataDlgProps => {
    const { rs, entity } = stateProps;
    const { dispatch, ...restDispatchProps } = dispatchProps;

    const setFieldValue = (fieldName: string, value: string)=> {
      if (rs) {
        dispatch(rsActions.setFieldValue({ name: rs.name, fieldName, value }));
      }
    };

    const loadRs = () => {
      const { url, id } = ownProps;
      if (entity) {
        const eq = prepareDefaultEntityQuery(entity, [id]);
        dispatch(loadRSActions.loadRS({ name: url, eq }));
      }
    };

    return (
      {
        ...stateProps,
        ...restDispatchProps,
        ...ownProps,
        setFieldValue,
        loadRs
      }
    );
  }
)(EntityDataDlg);