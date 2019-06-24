import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IDesignerStateProps, IDesignerContainerProps } from "./Designer.types";
import { Designer } from "./Designer";

export const DesignerContainer = connect(
  (state: IState, ownProps: IDesignerContainerProps): IDesignerStateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
  })
)(Designer);