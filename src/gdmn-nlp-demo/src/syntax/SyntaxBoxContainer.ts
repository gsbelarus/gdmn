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
  (state: State) => ({
    ...state.syntax,
    commandError: state.ermodel.commandError,
    command: state.ermodel.command
  }),
  (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>) => ({
    onSetText: (text: string) => dispatch(
      (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>, getState: () => State) => {
        dispatch(syntaxActions.setSyntaxText(text));
        const parsedText = getState().syntax.parsedText;
        if (parsedText && parsedText.phrase && parsedText.phrase instanceof RusPhrase) {
          dispatch(erModelActions.processPhrase(parsedText.phrase as RusPhrase));
        } else {
          dispatch(erModelActions.clearCommand(true));
        }
      }
    )
  })
)(SyntaxBox);