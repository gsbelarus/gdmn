import { connect } from 'react-redux';
import { State } from '../store';
import { ERModelBox } from './ERModelBox';

export const ERModelBoxContainer = connect(
  (state: State) => {
    if (state.ermodel['db']) {
      return {
        ...state.ermodel['db']
      }
    }

    return { loading: true };
  },
)(ERModelBox);