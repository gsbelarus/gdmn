import { connect } from 'react-redux';
import { ERModelBox } from './ERModelBox';
import { IState } from '@src/app/store/reducer';
import { connectView } from '@src/app/components/connectView';
import { compose } from 'recompose';

export const ERModelBoxContainer = compose<any, any>(
  connect(
    (state: IState) => {
      return {
        erModel: state.gdmnState.erModel
      }
    }
  ),
  connectView
)(ERModelBox);