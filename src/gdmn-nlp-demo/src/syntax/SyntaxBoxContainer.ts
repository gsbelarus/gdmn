import { connect } from 'react-redux';
import { State } from '../store';
import { SyntaxBox } from './SyntaxBox';
import { SyntaxAction } from './reducer';
import * as syntaxActions from './actions';
import * as erModelActions from '../ermodel/actions';
import { ThunkDispatch } from 'redux-thunk';
import { ERModelAction } from '../ermodel/reducer';
import { RusPhrase } from 'gdmn-nlp';
import { RecordSetAction } from 'gdmn-recordset';
import {GridAction} from 'gdmn-grid';

export const SyntaxBoxContainer = connect(
  (state: State) => (
    {
      ...state.syntax,
      erModels: state.ermodel,
      host: state.param.host,
      port: state.param.port,
    }
  ),
  (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction | RecordSetAction>) => ({
    onAnalyze: (erModelName: string, text: string) => dispatch(
      (dispatch: ThunkDispatch<State, never, SyntaxAction | ERModelAction>, getState: () => State) => {
        dispatch(syntaxActions.setSyntaxText(text));
        const parsedText = getState().syntax.parsedText;
        if (parsedText && parsedText.some(item => !!item.phrase && item.phrase instanceof RusPhrase)) {
          dispatch(erModelActions.processPhrase({name: erModelName, phrases: parsedText.map(item => item.phrase as RusPhrase)}));
        } else {
          dispatch(erModelActions.clearCommand({name: erModelName, clear: true}));
        }
      }
    ),
    onQuery: (erModelName: string) => dispatch(
      async (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction | SyntaxAction>, getState: () => State) => {
        const ermodel = getState().ermodel[erModelName];
        if (ermodel && ermodel.command && ermodel.command![0] && ermodel.executeCommand) {
          ermodel.executeCommand(dispatch, getState, erModelName, ermodel.command![0].payload);
        }
      }
    ),
   onClear: (name: string) => {
     dispatch(syntaxActions.clearSyntaxText());
     dispatch(erModelActions.clearCommand({ name, clear: true }));
    },
  })
)(SyntaxBox);
