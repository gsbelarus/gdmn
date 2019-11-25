import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IEntityDataViewContainerProps, IEntityDataViewStateProps } from "./EntityDataView.types";
import { EntityDataView } from "./EntityDataView";

export const EntityDataViewContainer = connect(
  (state: IState, ownProps: IEntityDataViewContainerProps): IEntityDataViewStateProps => {
    const rs = state.recordSet[ownProps.entityName];
    const masterRs = rs && rs.masterLink && state.recordSet[`${rs.masterLink.masterName}-master`];

    return {
      rs,
      masterRs,
      entity: state.gdmnState.erModel.entities[ownProps.entityName],
      masterEntity: masterRs ? state.gdmnState.erModel.entities[masterRs.name] : undefined,
      viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
      erModel: state.gdmnState.erModel,
      gcs: state.grid[ownProps.entityName],
      gridColors: state.gdmnState.gridColors
    }
  }
)(EntityDataView);
