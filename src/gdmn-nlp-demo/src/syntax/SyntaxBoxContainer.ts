import { connect } from 'react-redux';
import { State } from '../store';
import { SyntaxBox } from './SyntaxBox';
import { SyntaxAction } from './reducer';
import * as syntaxActions from "./actions";
import * as erModelActions from "../ermodel/actions";
import { ThunkDispatch } from 'redux-thunk';
import { ERModelAction } from '../ermodel/reducer';
import { RusPhrase } from 'gdmn-nlp';

export const SyntaxBoxContainer = connect(
  (state: State) => {
    if (state.ermodel['db']) {
      return {
        ...state.syntax,
        commandError: state.ermodel['db'].commandError,
        command: state.ermodel['db'].command
      }
    }

    return {...state.syntax};
  },
  (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>) => ({
    onSetText: (text: string) => dispatch(
      (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>, getState: () => State) => {
        dispatch(syntaxActions.setSyntaxText(text));
        const parsedText = getState().syntax.parsedText;
        if (parsedText && parsedText.phrase && parsedText.phrase instanceof RusPhrase) {
          dispatch(erModelActions.processPhrase({ name: 'db', phrase: parsedText.phrase as RusPhrase }));
        } else {
          dispatch(erModelActions.clearCommand({ name: 'db', clear: true }));
        }
      }
    )
  })
)(SyntaxBox);