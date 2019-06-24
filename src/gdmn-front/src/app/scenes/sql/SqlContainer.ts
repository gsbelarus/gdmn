import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { ISqlStateProps, ISqlContainerProps } from "./Sql.types";
import { Sql } from "./Sql";

export const SqlContainer = connect(
  (state: IState, ownProps: ISqlContainerProps): ISqlStateProps => ({
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
  })
)(Sql);
