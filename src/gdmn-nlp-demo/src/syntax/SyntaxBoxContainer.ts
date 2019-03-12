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
import { executeCommand as executeGDMNCommand } from './gdmnEngine';
import { executeCommand as executeNBRBCommand } from './nbrbEngine';
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
        if (parsedText && parsedText.phrase && parsedText.phrase instanceof RusPhrase) {
          dispatch(erModelActions.processPhrase({name: erModelName, phrase: parsedText.phrase as RusPhrase}));
        } else {
          dispatch(erModelActions.clearCommand({name: erModelName, clear: true}));
        }
      }
    ),
    onQuery: (erModelName: string) => dispatch(
      async (dispatch: ThunkDispatch<State, never, RecordSetAction | GridAction | SyntaxAction>, getState: () => State) => {
        const { ermodel } = getState();

        if (!ermodel || !ermodel[erModelName] || !ermodel[erModelName].command || !ermodel[erModelName].command![0]) return;

        dispatch(syntaxActions.loadingQuery(true));

        try {
          if (erModelName === 'db') {
            executeGDMNCommand(dispatch, 'db', ermodel['db'].command![0].payload);
          } else {
            executeNBRBCommand(dispatch, 'nbrb', ermodel['nbrb'].command![0].payload);
          }
        }
        finally {
          dispatch(syntaxActions.loadingQuery(false));
        }
      }
    ),
   onClear: (name: string) => {
     dispatch(syntaxActions.clearSyntaxText());
     dispatch(erModelActions.clearCommand({ name, clear: true }));
    },
    onLoading: (value: boolean) => {
      dispatch(syntaxActions.loadingQuery(value));
    }
  })
)(SyntaxBox);

