import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { NLPDialog } from 'gdmn-nlp-agent';

export type NLPDialogAction = ActionType<typeof actions>;

export function reducer(state: NLPDialog = [], action: NLPDialogAction): NLPDialog {
  switch (action.type) {
    case getType(actions.clearNLPDialog): {
      return [];
    }

    case getType(actions.addNLPItem): {
      return [...state, action.payload];
    }
  }

  return state;
};