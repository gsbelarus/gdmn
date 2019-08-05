import { connect } from "react-redux";
import { IState } from "@src/app/store/reducer";
import { EntityAttribute } from "./EntityAttribute";
import {IEntityAttributeStateProps} from "./EntityAttribute.types";


export const EntityAttributeContainer = connect(
  (state: IState): IEntityAttributeStateProps => ({
    erModel: state.gdmnState.erModel,
  })
)(EntityAttribute);
