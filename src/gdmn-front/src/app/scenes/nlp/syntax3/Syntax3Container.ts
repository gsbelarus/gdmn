import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { ISyntax3ContainerProps, ISyntax3StateProps } from "./Syntax3.types";
import { Syntax3 } from "./Syntax3";

export const Syntax3Container = connect(
  (state: IState, ownProps: ISyntax3ContainerProps): ISyntax3StateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
    theme: state.gdmnState.theme,
    erModel: state.gdmnState.erModel
  })
)(Syntax3);