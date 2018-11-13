import { IToken } from 'chevrotain';
import { morphAnalyzer, tokenize, AnyWord, CyrillicWord } from 'gdmn-nlp';
import { getType } from 'typesafe-actions';
import { MorphologyActions, morphologyActions } from './actions';

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

export function reducer(state: IMorphologyState = initialState, action: MorphologyActions): IMorphologyState {
  switch (action.type) {
    case getType(morphologyActions.setMorphText): {
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