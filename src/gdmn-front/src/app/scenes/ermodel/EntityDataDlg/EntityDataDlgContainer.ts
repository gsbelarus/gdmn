import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { EntityDataDlg } from "./EntityDataDlg";
import { IEntityDataDlgStateProps, IEntityDataDlgContainerProps, IEntityDataDlgProps } from "./EntityDataDlg.types";
import { ThunkDispatch } from "redux-thunk";
import { TGdmnActions, gdmnActions } from "../../gdmn/actions";
import { IViewTab } from "../../gdmn/types";
import { Entity } from "gdmn-orm";
import { prepareDefaultEntityQuery } from "../entityData/utils";
import { loadRSActions, LoadRSActions } from "@src/app/store/loadRSActions";

export const EntityDataDlgContainer = connect(
  (state: IState, ownProps: IEntityDataDlgContainerProps): IEntityDataDlgStateProps => ({
    erModel: state.gdmnState.erModel,
    rs: state.recordSet[ownProps.url],
    entity: state.gdmnState.erModel.entities[ownProps.entityName]
  }),
  (dispatch: ThunkDispatch<IState, never, TGdmnActions | LoadRSActions>) => ({
    addViewTab: (viewTab: IViewTab) => dispatch(gdmnActions.addViewTab(viewTab)),
    loadRS: (name: string, entity: Entity, id: string) => {
      const eq = prepareDefaultEntityQuery(entity, [id]);
      dispatch(loadRSActions.loadRS({ name, eq }));
    }
  }),
  (stateProps, dispatchProps, ownProps): IEntityDataDlgProps => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps
  })
)(EntityDataDlg);