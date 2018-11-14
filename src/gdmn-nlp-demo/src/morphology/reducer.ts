import { IToken } from 'chevrotain';
import { morphAnalyzer, tokenize, AnyWord, CyrillicWord } from 'gdmn-nlp';
import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type MorphologyAction = ActionType<typeof actions>;

export interface IMorphologyState {
  readonly text: string;
  readonly token?: IToken;
  readonly words: AnyWord[];
}

const initialText = '';

const initialState: IMorphologyState = {
  text: initialText,
  words: []
};

export function reducer(state: IMorphologyState = initialState, action: MorphologyAction): IMorphologyState {
  switch (action.type) {
    case getType(actions.setMorphText): {
      const text = action.payload;
      const tokens = tokenize(text);

      if (tokens.length && tokens[0].tokenType === CyrillicWord) {
        return {
          text,
          token: tokens[0],
          words: morphAnalyzer(tokens[0].image)
        }
      } else {
        return {
          text,
          words: []
        }
      }
    }
  }

  return state;
};