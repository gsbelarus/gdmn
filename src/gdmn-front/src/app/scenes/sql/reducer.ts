import {gdmnActions, TGdmnActions} from "@src/app/scenes/gdmn/actions";
import * as actions from "@src/app/scenes/sql/actions";
import {ActionType, getType} from "typesafe-actions";

export interface ISqlState {
  expression: string;
  url: string;
}

const initialState: ISqlState = {
  expression: "select * from gd_contact",
  url: ""
};

export type SqlActions = ActionType<typeof actions>;

export function reducer(state: ISqlState = initialState, action: SqlActions | TGdmnActions) {
  switch (action.type) {
    case getType(actions.init): {
      return {
        ...state,
        url: action.payload.url
      };
    }
    case getType(actions.setExpression): {
      return {
        ...state,
        expression: action.payload.expression
      };
    }
    case getType(gdmnActions.deleteViewTab): {
      if (action.payload.url === state.url) {
        return {...initialState};
      }
      return state;
    }
    case getType(actions.clear): {
      return {...initialState};
    }
    default:
      return state;
  }
}
