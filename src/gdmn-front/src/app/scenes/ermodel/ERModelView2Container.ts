import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { IERModelView2StateProps, IERModelView2ContainerProps } from "./ERModelView2.types";
import { ERModelView2 } from "./ERModelView2";

export const ERModelView2Container = connect(
  (state: IState, ownProps: IERModelView2ContainerProps): IERModelView2StateProps => ({
    entities: state.recordSet.entities,
    attributes: state.recordSet.attributes,
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.match.url ),
    erModel: state.gdmnState.erModel,
    gcsEntities: state.grid.entities,
    gcsAttributes: state.grid.attributes,
  })
)(ERModelView2);