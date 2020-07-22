/*

import { connect } from "react-redux";
import { IState } from "../store/reducer";
import { LookupComboBox, ILookupComboBoxProps } from "./LookupComboBox/LookupComboBox";

interface ISFLookupComboBoxContainerProps {};

export const SFLookupComboBoxContainer = connect(
  (state: IState, ownProps: ISFLookupComboBoxContainerProps): ILookupComboBoxProps => ({
    rs: state.recordSet[ownProps.url],
    entity: state.gdmnState.erModel.entities[ownProps.entityName],
    srcRs: state.recordSet[ownProps.entityName],
    erModel: state.gdmnState.erModel,
    viewTab: state.gdmnState.viewTabs.find( vt => vt.url === ownProps.url )
  })
)(LookupComboBox);

*/