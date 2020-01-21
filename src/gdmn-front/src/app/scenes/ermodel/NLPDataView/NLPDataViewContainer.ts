import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { INLPDataViewContainerProps, INLPDataViewStateProps } from "./NLPDataView.types";
import { NLPDataView } from "./NLPDataView";

export const NLPDataViewContainer = connect(
  (state: IState, ownProps: INLPDataViewContainerProps): INLPDataViewStateProps => {
    const rs = state.recordSet[ownProps.rsName];
    const masterRs = rs?.masterLink && state.recordSet[rs.masterLink.masterName];

    return {
      rs,
      masterRs,
      viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
      erModel: state.gdmnState.erModel,
      gcs: rs && state.grid[rs.name],
      gcsMaster: masterRs && state.grid[masterRs.name],
      gridColors: state.gdmnState.gridColors
    }
  }
)(NLPDataView);
