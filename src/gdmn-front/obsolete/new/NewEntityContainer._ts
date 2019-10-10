import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { NewEntity } from "./NewEntity";
import { INewEntityStateProps, INewEntityContainerProps } from "./NewEntity.types";

export const NewEntityContainer = connect(
  (state: IState, ownProps: INewEntityContainerProps): INewEntityStateProps => ({
    erModel: state.gdmnState.erModel,
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.match.url ),
    gcsEntities: state.grid.entities,
    entities: state.recordSet.entities,
  })
)(NewEntity);
