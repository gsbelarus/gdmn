import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { NLPDialog, INLPDialogItem } from 'gdmn-nlp-agent';
import { ParsedText, parsePhrase } from 'gdmn-nlp';

export type NLPDialogAction = ActionType<typeof actions>;

export interface INLPDialogState {
  items: NLPDialog;
  parsedText?: ParsedText;
};

const initialState = {
  items: []
};

export function reducer(state: INLPDialogState = initialState, action: NLPDialogAction): INLPDialogState {
  switch (action.type) {
    case getType(actions.clearNLPDialog): {
      return initialState;
    }

    case getType(actions.addNLPItem): {

      const { who, text } = action.payload;
      const newItems: INLPDialogItem[] = [action.payload];
      let parsedText;

      if (who === 'me') {
        try {
          parsedText = parsePhrase(text);
          newItems.push({
            who: 'it',
            text: 'готово!'
          });
        }
        catch(e) {
          newItems.push({
            who: 'it',
            text: e.message
          });
        }
      }

      return {
        ...state,
        parsedText,
        items: [...state.items, ...newItems]
      }
    }
  }

  return state;
};