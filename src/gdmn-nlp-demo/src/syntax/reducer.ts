import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type SyntaxAction = ActionType<typeof actions>;

export interface ISyntaxState {
  readonly text: string;
}

const initialText = '';

const initialState: ISyntaxState = {
  text: initialText
};

export function reducer(state: ISyntaxState = initialState, action: SyntaxAction): ISyntaxState {
  switch (action.type) {
    case getType(actions.setSyntaxText): {
      const text = action.payload;
      return {...state, text};
    }
  }

  return state;
};