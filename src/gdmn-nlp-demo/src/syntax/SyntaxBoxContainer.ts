import { connect } from 'react-redux';
import { State } from '../store';
import { SyntaxBox } from './SyntaxBox';
import { SyntaxAction } from './reducer';
import * as syntaxActions from "./actions";
import * as erModelActions from "../ermodel/actions";
import { ThunkDispatch } from 'redux-thunk';
import { ERModelAction } from '../ermodel/reducer';
import { RusPhrase } from 'gdmn-nlp';
import { RecordSetAction } from 'gdmn-recordset';
import { EntityQuery } from 'gdmn-orm';

export const SyntaxBoxContainer = connect(
  (state: State) => {
    const erModel = state.ermodel['db'];
    if (erModel) {
      return {
        ...state.syntax,
        isVisibleQuery: erModel.command && state.param.host && state.param.port,
        commandError: erModel.commandError,
        command: erModel.command
      }
    }

    return {...state.syntax};
  },
  (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction | RecordSetAction>) => ({
    onSetText: (text: string) => dispatch(
      (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>, getState: () => State) => {
        dispatch(syntaxActions.setSyntaxText(text));
        const parsedText = getState().syntax.parsedText;
        if (parsedText && parsedText.phrase && parsedText.phrase instanceof RusPhrase) {
          dispatch(erModelActions.processPhrase({ name: 'db', phrase: parsedText.phrase as RusPhrase }));
        } else {
          dispatch(erModelActions.clearCommand({ name: 'db', clear: true }));
        }
      }
    ),
    onLoadRecordSet: (query: EntityQuery) => dispatch(
      (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>, getState: () => State) => {
        const {host, port} = getState().param;
        dispatch(syntaxActions.loadRecordSet(query, host, port));
      }
    )
  })
)(SyntaxBox);
