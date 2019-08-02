import { FSM } from "./fsm";
import { FSMActions } from "./actions";

export interface IFSMState {
  fsm?: FSM;
};

export function reducer(state: IFSMState = {}, action: FSMActions) {
  return state;
};