import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { IToken } from 'chevrotain';
import { combinatorialMorph } from 'gdmn-nlp';

export type SyntaxAction = ActionType<typeof actions>;

export interface ISyntaxState {
  readonly text: string;
  readonly coombinations: IToken[][];
}

const initialText = 'покажи всех клиентов из минска';

const initialState: ISyntaxState = {
  text: initialText,
  coombinations: []
};

export function reducer(state: ISyntaxState = initialState, action: SyntaxAction): ISyntaxState {
  switch (action.type) {
    case getType(actions.setSyntaxText): {
      const text = action.payload;
      return {
        ...state,
        text,
        coombinations: combinatorialMorph(text)
      };
    }
  }

  return state;
};