import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IBPContainerProps, IBPStateProps } from "./BP.types";
import { BP } from "./BP";

export const BPContainer = connect(
  (state: IState, ownProps: IBPContainerProps): IBPStateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
  })
)(BP);