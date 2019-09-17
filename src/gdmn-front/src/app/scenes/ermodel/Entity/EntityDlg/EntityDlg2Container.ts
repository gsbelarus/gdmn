import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IEntityDlgContainerProps, IEntityDlgStateProps } from "./EntityDlg.types";
import { EntityDlg } from "./EntityDlg";

export const EntityDlgContainer = connect(
  (state: IState, ownProps: IEntityDlgContainerProps): IEntityDlgStateProps => ({
    erModel: state.gdmnState.erModel,
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.match.url )
  })
)(EntityDlg);
