import { connect } from 'react-redux';
import { State } from '../store';
import { ChatBox } from './ChatBox';

export const ChatBoxContainer = connect(
  (state: State) => ({
    ...state.nlpDialog
  }),
)(ChatBox);