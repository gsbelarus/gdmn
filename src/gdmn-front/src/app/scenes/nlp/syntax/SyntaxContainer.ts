import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { ISyntaxContainerProps, ISyntaxStateProps } from "./Syntax.types";
import { Syntax } from "./Syntax";

export const SyntaxContainer = connect(
  (state: IState, ownProps: ISyntaxContainerProps): ISyntaxStateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
    theme: state.gdmnState.theme
  })
)(Syntax);