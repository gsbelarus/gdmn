import { connect } from "react-redux";
import { AccountView } from "./AccountView";
import { IAccountViewStateProps, IAccountViewContainerProps } from "./AccountView.types";
import { IState } from "@src/app/store/reducer";

export const AccountViewContainer = connect(
  (state: IState, ownProps: IAccountViewContainerProps): IAccountViewStateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
  })
)(AccountView);