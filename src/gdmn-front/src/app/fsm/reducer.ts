import { FSM } from "./fsm";
import { FSMActions, fsmActions } from "./actions";
import { getType } from "typesafe-actions";

export interface IFSMState {
  fsm?: FSM;
};

export function reducer(state: IFSMState = {}, action: FSMActions) {

  switch (action.type) {
    case getType(fsmActions.setFSM): {
      return {
        ...state,
        fsm: action.payload
      }
    }

    case getType(fsmActions.destroyFSM): {
      return {
        ...state,
        fsm: undefined
      }
    }
  }

  return state;
};