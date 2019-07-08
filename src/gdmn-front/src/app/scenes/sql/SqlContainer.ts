import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { ISQLStateProps, ISqlContainerProps } from "./Sql.types";
import { Sql } from "./Sql";

export const SqlContainer = connect(
  (state: IState, ownProps: ISqlContainerProps): ISQLStateProps => ({
    rs: state.recordSet[ownProps.id],
    gcs: state.grid[ownProps.id],
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
  })
)(Sql);
