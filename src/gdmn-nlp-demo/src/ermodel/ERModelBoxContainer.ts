import { connect } from 'react-redux';
import { State } from '../store';
import { ERModelBox } from './ERModelBox';

export const ERModelBoxContainer = connect(
  (state: State) => ({
    ...state.ermodel
  }),
)(ERModelBox);