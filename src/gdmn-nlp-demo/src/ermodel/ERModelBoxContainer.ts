import { connect } from 'react-redux';
import { State } from '../store';
import { ERModelBox } from './ERModelBox';
import { RouteComponentProps } from 'react-router';

export const ERModelBoxContainer = connect(
  (state: State, ownProps: RouteComponentProps<{ name: string }>) => {
    const name = ownProps.match.params.name;

    if (state.ermodel[name]) {
      return {
        ...state.ermodel[name]
      }
    }

    return { loading: true };
  },
)(ERModelBox);