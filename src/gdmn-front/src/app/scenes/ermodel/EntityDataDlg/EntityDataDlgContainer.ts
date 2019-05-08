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
  (dispatch: ThunkDispatch<IState, never, GdmnAction | LoadRSActions | RSAction>) => ({
    dispatch,
    addViewTab: (viewTab: IViewTab) => dispatch(gdmnActions.addViewTab(viewTab))
  }),
  (stateProps, dispatchProps, ownProps): IEntityDataDlgProps => {
    const { rs, entity } = stateProps;
    const { dispatch, ...restDispatchProps } = dispatchProps;

    if (!rs && entity) {
      const { url, id } = ownProps;
      const eq = prepareDefaultEntityQuery(entity, [id]);
      dispatch(loadRSActions.loadRS({ name: url, eq }));
    }

    const setFieldValue = (fieldName: string, value: string)=> {
      if (rs) {
        dispatch(rsActions.setFieldValue({ name: rs.name, fieldName, value }));
      }
    };

    return (
      {
        ...stateProps,
        ...restDispatchProps,
        ...ownProps,
        setFieldValue
      }
    );
  }
)(EntityDataDlg);