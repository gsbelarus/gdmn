import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IDesigner2ContainerProps, IDesigner2StateProps } from "./Designer2.types";
import { Designer2 } from "./Designer2";

export const Designer2Container = connect(
  (state: IState, ownProps: IDesigner2ContainerProps): IDesigner2StateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
    theme: state.gdmnState.theme
  })
)(Designer2);