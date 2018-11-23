import {gdmnActions, TGdmnActions} from "@src/app/scenes/gdmn/actions";
import {ERModel} from "gdmn-orm";
import {getType} from "typesafe-actions";

interface IGdmnState {
  erModel: ERModel;
}

const initialState: IGdmnState = {
  erModel: new ERModel()
};

function reducer(state: IGdmnState = initialState, action: TGdmnActions) {
  switch (action.type) {
    case getType(gdmnActions.setSchema): {
      return {
        ...state,
        erModel: action.payload
      };
    }
    default:
      return state;
  }
}

export {reducer, IGdmnState};
