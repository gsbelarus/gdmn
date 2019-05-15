import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { EntityDataDlg } from "./EntityDataDlg";
import { IEntityDataDlgStateProps, IEntityDataDlgContainerProps } from "./EntityDataDlg.types";

export const EntityDataDlgContainer = connect(
  (state: IState, ownProps: IEntityDataDlgContainerProps): IEntityDataDlgStateProps => ({
    rs: state.recordSet[ownProps.url],
    entity: state.gdmnState.erModel.entities[ownProps.entityName],
    srcRs: state.recordSet[ownProps.entityName],
    erModel: state.gdmnState.erModel,
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
  })
)(EntityDataDlg);