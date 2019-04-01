import {gdmnActions, TGdmnActions} from "@src/app/scenes/gdmn/actions";
import * as actions from "@src/app/scenes/sql/data/actions";
import {ActionType, getType} from "typesafe-actions";

export interface ISqlDataViewState {
  requests: {
    id: string;
    expression: string;
  }[]
}

const initialState: ISqlDataViewState = {
  requests: []
};

export type SqlQueryActions = ActionType<typeof actions>;

export function reducer(state: ISqlDataViewState = initialState, action: SqlQueryActions | TGdmnActions) {
  switch (action.type) {
    case getType(actions.createQuery): {
      return {
        requests: [...state.requests, action.payload]
      }
    }
    default:
      return state;
  }
}
