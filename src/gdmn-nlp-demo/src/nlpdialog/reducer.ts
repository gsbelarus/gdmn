import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { NLPDialog } from 'gdmn-nlp-agent';
import { ParsedText } from 'gdmn-nlp';

export type NLPDialogAction = ActionType<typeof actions>;

export interface INLPDialogState {
  items: NLPDialog;
  parsedText?: ParsedText;
  recordSetName?: string;
};

const initialState = {
  items: []
};

export function reducer(state: INLPDialogState = initialState, action: NLPDialogAction): INLPDialogState {
  switch (action.type) {
    case getType(actions.clearNLPDialog): {
      return {...initialState};
    }

    case getType(actions.addNLPItem): {

      const { item, parsedText, recordSetName } = action.payload;

      return {
        ...state,
        parsedText,
        recordSetName,
        items: [...state.items, item]
      }
    }
  }

  return state;
};