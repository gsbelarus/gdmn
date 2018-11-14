import { connect } from 'react-redux';
import { State } from '../store';
import { SyntaxBox } from './SyntaxBox';
import { Dispatch } from 'redux';
import { SyntaxAction } from './reducer';
import * as actions from "./actions";

export const SyntaxBoxContainer = connect(
  (state: State) => ({
    ...state.syntax
  }),
  (dispatch: Dispatch<SyntaxAction>) => ({
    onSetText: (text: string) => dispatch(actions.setSyntaxText(text))
  })
)(SyntaxBox);