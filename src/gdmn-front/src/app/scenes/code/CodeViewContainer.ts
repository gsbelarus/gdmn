import { connect } from "react-redux";
import { ICodeViewContainerProps, ICodeViewStateProps } from "./CodeView.types";
import { IState } from "@src/app/store/reducer";
import { CodeView } from "./CodeView";

export const CodeViewContainer = connect(
  (state: IState, ownProps: ICodeViewContainerProps): ICodeViewStateProps => {
    return {
      viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
    }
  }
)(CodeView);