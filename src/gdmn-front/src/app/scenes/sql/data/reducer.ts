import {gdmnActions, TGdmnActions} from "@src/app/scenes/gdmn/actions";
import * as actions from "@src/app/scenes/sql/data/actions";
import {ActionType, getType} from "typesafe-actions";

export interface ISqlDataViewState {
  request: {
    id: string;
    text: string;
  }[]
}

const initialState: ISqlDataViewState = {
  request: []
};

export type SqlQueryActions = ActionType<typeof actions>;

export function reducer(state: ISqlDataViewState = initialState, action: SqlQueryActions) {
  switch (action.type) {
    case getType(actions.createQuery): {
      return {
        ...state,
      };
    }
    default:
      return state;
  }
}
