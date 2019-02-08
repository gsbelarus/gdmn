import { combineReducers, createStore, applyMiddleware, Store } from "redux";
import { reducer as morphologyReducer, IMorphologyState, MorphologyAction } from './morphology/reducer';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk, { ThunkMiddleware, ThunkDispatch } from 'redux-thunk';
import { reducer as syntaxReducer, ISyntaxState, SyntaxAction } from "./syntax/reducer";
import { reducer as ermodelReducer, ERModelAction, IERModels } from "./ermodel/reducer";
import { gridReducer, GridReducerState, GridAction } from 'gdmn-grid';
import { reducer as nlpDialogReducer, NLPDialogAction } from './nlpdialog/reducer';
import { RecordSetReducerState, recordSetReducer, RecordSetAction } from 'gdmn-recordset';
import { NLPDialog } from "gdmn-nlp-agent";

export type Actions = ERModelAction | MorphologyAction | SyntaxAction | RecordSetAction | GridAction | NLPDialogAction;

export interface State {
  morphology: IMorphologyState;
  syntax: ISyntaxState;
  ermodel: IERModels;
  grid: GridReducerState;
  recordSet: RecordSetReducerState;
  nlpDialog: NLPDialog;
};

const rootReducer = combineReducers<State, Actions>(
  {
    morphology: morphologyReducer,
    syntax: syntaxReducer,
    ermodel: ermodelReducer,
    grid: gridReducer,
    recordSet: recordSetReducer,
    nlpDialog: nlpDialogReducer
  }
);

const store: Store<State, Actions> = createStore<State, Actions, {}, {}>(
  rootReducer,
  {} as State,
  composeWithDevTools(applyMiddleware(thunk as ThunkMiddleware<State, Actions>))
);

export type ThunkFunc = (dispatch: ThunkDispatch<State, never, Actions>, getState: () => State) => void;

export function dispatchThunk(f: ThunkFunc) {
  (store.dispatch as ThunkDispatch<State, never, Actions>)(f);
};

export default store;