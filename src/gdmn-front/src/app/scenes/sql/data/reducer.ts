import {gdmnActions, GdmnAction} from "@src/app/scenes/gdmn/actions";
import * as actions from "@src/app/scenes/sql/data/actions";
import {ActionType, getType} from "typesafe-actions";

export interface ISqlDataViewState {
  requests: {
    id: string;
    expression: string;
  }[]
}

const initialState: ISqlDataViewState = {
  requests: [
    {id: '1', expression: 'select u.name as username, u.id, c.name, c.id from gd_user u join gd_contact c on c.id = u.contactkey'},
    {id: '2', expression: 'select * from gd_contact'},
  ]
};

export type SqlQueryActions = ActionType<typeof actions>;

export function reducer(state: ISqlDataViewState = initialState, action: SqlQueryActions | GdmnAction) {
  switch (action.type) {
    case getType(actions.createQuery): {
      return {
        requests: [...state.requests, action.payload]
      }
    }
    case getType(actions.updateQuery): {
      return {
        requests:
          state.requests.map(i => i.id === action.payload.id ? action.payload : i)
      };
    }
    default:
      return state;
  }
}
