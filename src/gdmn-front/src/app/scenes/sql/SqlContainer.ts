import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { ISqlStateProps, ISqlContainerProps } from "./Sql.types";
import { Sql } from "./Sql";

export const SqlContainer = connect(
  (state: IState, ownProps: ISqlContainerProps): ISqlStateProps => ({
    rs: state.recordSet[ownProps.sqlName],
    gcs: state.grid[ownProps.sqlName],
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
  })
)(Sql);
