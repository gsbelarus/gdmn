import { combineReducers, createStore, AnyAction, applyMiddleware } from "redux";
import { reducer as morphologyReducer, IMorphologyState } from './morphology/reducer';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { reducer as syntaxReducer, ISyntaxState } from "./syntax/reducer";

export interface State {
  morphology: IMorphologyState;
  syntax: ISyntaxState;
};

const rootReducer = combineReducers<State>(
  {
    morphology: morphologyReducer,
    syntax: syntaxReducer
  }
);

const store = createStore<State, AnyAction, {}, {}>(rootReducer, {} as State, composeWithDevTools(applyMiddleware(thunk)));

export default store;