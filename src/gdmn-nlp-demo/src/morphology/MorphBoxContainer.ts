import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { State } from '../store';
import { MorphologyActions, morphologyActions } from './actions';
import { MorphBox } from './MorphBox';

export const MorphBoxContainer = connect(
  (state: State) => ({
    ...state.morphology
  }),
  (dispatch: Dispatch<MorphologyActions>) => ({
    onSetText: (text: string) => dispatch(morphologyActions.setMorphText(text))
  })
)(MorphBox);