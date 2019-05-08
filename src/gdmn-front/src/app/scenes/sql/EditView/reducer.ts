import {gdmnActions, GdmnAction} from "@src/app/scenes/gdmn/actions";
import * as actions from "@src/app/scenes/sql/EditView/actions";
import {ActionType, getType} from "typesafe-actions";

export interface ISqlState {
  expression: string;
  url: string;
  id: string;
}

const initialState: ISqlState = {
  expression: "select * from gd_contact",
  url: "",
  id: ""
};

export type SqlActions = ActionType<typeof actions>;

export function reducer(state: ISqlState = initialState, action: SqlActions | GdmnAction) {
  switch (action.type) {
    case getType(actions.init): {
      return {
        ...state,
        expression: action.payload.expression,
        id: action.payload.id
      };
    }
    case getType(actions.setExpression): {
      return {
        ...state,
        expression: action.payload.expression
      };
    }
    case getType(gdmnActions.deleteViewTab): {
      if (action.payload.viewTabURL === state.url) {
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
