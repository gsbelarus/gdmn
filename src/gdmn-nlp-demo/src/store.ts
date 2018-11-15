import { combineReducers, createStore, AnyAction, applyMiddleware, Store } from "redux";
import { reducer as morphologyReducer, IMorphologyState, MorphologyAction } from './morphology/reducer';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk, { ThunkMiddleware, ThunkDispatch } from 'redux-thunk';
import { reducer as syntaxReducer, ISyntaxState, SyntaxAction } from "./syntax/reducer";
import { reducer as ermodelReducer, IERModelState, ERModelAction } from "./ermodel/reducer";

export type Actions = ERModelAction | MorphologyAction | SyntaxAction;

export interface State {
  morphology: IMorphologyState;
  syntax: ISyntaxState;
  ermodel: IERModelState;
};

const rootReducer = combineReducers<State, Actions>(
  {
    morphology: morphologyReducer,
    syntax: syntaxReducer,
    ermodel: ermodelReducer
  }
);

const store: Store<State, Actions> = createStore<State, Actions, {}, {}>(rootReducer, {} as State, composeWithDevTools(applyMiddleware(thunk as ThunkMiddleware<State, Actions>)));

export type ThunkFunc = (dispatch: ThunkDispatch<State, never, Actions>, getState: () => State) => void;

export function dispatchThunk(f: ThunkFunc) {
  (store.dispatch as ThunkDispatch<State, never, Actions>)(f);
};

export default store;