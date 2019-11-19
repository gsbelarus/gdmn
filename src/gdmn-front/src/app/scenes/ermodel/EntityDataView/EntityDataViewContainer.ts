import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IEntityDataViewContainerProps, IEntityDataViewStateProps } from "./EntityDataView.types";
import { EntityDataView } from "./EntityDataView";

export const EntityDataViewContainer = connect(
  (state: IState, ownProps: IEntityDataViewContainerProps): IEntityDataViewStateProps => ({
    rs: state.recordSet,
    entity: state.gdmnState.erModel.entities[ownProps.entityName],
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
    erModel: state.gdmnState.erModel,
    gcs: state.grid[ownProps.entityName],
    gridColors: state.gdmnState.gridColors,
    allBinding: state.mdgState.bindMasterDetails
  })
)(EntityDataView);
