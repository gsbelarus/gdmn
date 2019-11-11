import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IMorphologyContainerProps, IMorphologyStateProps } from "./Morphology.types";
import { Morphology } from "./Morphology";

export const MorphologyContainer = connect(
  (state: IState, ownProps: IMorphologyContainerProps): IMorphologyStateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
    theme: state.gdmnState.theme
  })
)(Morphology);