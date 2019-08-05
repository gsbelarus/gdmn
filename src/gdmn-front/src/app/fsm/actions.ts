import { ActionType, createAction } from 'typesafe-actions';
import { FSM } from './fsm';

export const fsmActions = {
  setFSM: createAction('fsm/SET_FSM', resolve => {
    return (fsm: FSM) => resolve(fsm);
  }),
  destroyFSM: createAction('fsm/DESTROY_FSM')
};

export type FSMActions = ActionType<typeof fsmActions>;

