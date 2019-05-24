import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IEntityDataView2ContainerProps, IEntityDataView2StateProps } from "./EntityDataView.types";
import { EntityDataView } from "./EntityDataView";

export const EntityDataViewContainer = connect(
  (state: IState, ownProps: IEntityDataView2ContainerProps): IEntityDataView2StateProps => ({
    rs: state.recordSet[ownProps.entityName],
    entity: state.gdmnState.erModel.entities[ownProps.entityName],
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url ),
    erModel: state.gdmnState.erModel,
    gcs: state.grid[ownProps.entityName]
  })
)(EntityDataView);