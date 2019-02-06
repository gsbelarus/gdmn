import { connect } from 'react-redux';
import { State } from '../store';
import { ChatBox } from './NLPDialogBox';
import { Dispatch } from 'redux';
import { NLPDialogAction } from './reducer';
import { addNLPItem } from './actions';

export const ChatBoxContainer = connect(
  (state: State) => ({
    nlpDialog: state.nlpDialog
  }),
  (dispatch: Dispatch<NLPDialogAction>) => ({
    addNLPMessage: (text: string) => dispatch(addNLPItem({ who: 'me', text }))
  })
)(ChatBox);