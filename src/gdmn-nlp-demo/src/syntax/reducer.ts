import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { IToken } from 'chevrotain';
import { combinatorialMorph, ParsedText, parsePhrase, debugPhrase } from 'gdmn-nlp';
import { predefinedPhrases } from './phrases';

export type SyntaxAction = ActionType<typeof actions>;

export interface ISyntaxState {
  readonly text: string;
  readonly coombinations: IToken[][];
  readonly loading: boolean;
  readonly errorMsg?: string;
  readonly parsedText?: ParsedText;
  readonly parserDebug?: ParsedText[];
};

const initialText = predefinedPhrases[0];

const initialState: ISyntaxState = {
  text: initialText,
  coombinations: [],
  loading: false
};

export function reducer(state: ISyntaxState = initialState, action: SyntaxAction): ISyntaxState {
  switch (action.type) {
    case getType(actions.clearSyntaxText): {
      return {
        ...state,
        text: '',
        coombinations: [],
      }
    }

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

    case getType(actions.loadingQuery): {
      const value = action.payload;
      return {
        ...state,
        loading: value
      }
    }

  }

  return state;
};
