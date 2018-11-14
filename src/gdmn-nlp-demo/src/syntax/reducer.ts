import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { IToken } from 'chevrotain';
import { combinatorialMorph, ParsedText, parsePhrase, debugPhrase } from 'gdmn-nlp';

export type SyntaxAction = ActionType<typeof actions>;

export interface ISyntaxState {
  readonly text: string;
  readonly coombinations: IToken[][];
  readonly errorMsg?: string;
  readonly parsedText?: ParsedText;
  readonly parserDebug?: ParsedText[];
};

const initialText = 'покажи всех клиентов из минска';

const initialState: ISyntaxState = {
  text: initialText,
  coombinations: []
};

export function reducer(state: ISyntaxState = initialState, action: SyntaxAction): ISyntaxState {
  switch (action.type) {
    case getType(actions.setSyntaxText): {
      const text = action.payload;
      let coombinations = combinatorialMorph(text);
      let parsedText: ParsedText;

      try {
        parsedText = parsePhrase(text);
      }
      catch(e) {
        return {
          ...state,
          coombinations,
          parsedText: undefined,
          errorMsg: e.message,
          parserDebug: debugPhrase(text)
        };
      }

      if (!parsedText.phrase) {
        return {
          ...state,
          coombinations,
          parsedText: undefined,
          errorMsg: undefined,
          parserDebug: debugPhrase(text)
        };
      }

      return {
        ...state,
        text,
        coombinations,
        parsedText,
        errorMsg: undefined,
        parserDebug: undefined
      };
    }
  }

  return state;
};