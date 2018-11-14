import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { State } from '../store';
import * as actions from './actions';
import { MorphBox } from './MorphBox';
import { MorphologyAction } from './reducer';

export const MorphBoxContainer = connect(
  (state: State) => ({
    ...state.morphology
  }),
  (dispatch: Dispatch<MorphologyAction>) => ({
    onSetText: (text: string) => dispatch(actions.setMorphText(text))
  })
)(MorphBox);