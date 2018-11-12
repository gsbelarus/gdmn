import { combineReducers, createStore, AnyAction, applyMiddleware } from "redux";
import { State as MorphologyState, reducer as morphologyReducer } from './morphology/reducer';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

export interface State {
  morphology: MorphologyState;
};

const rootReducer = combineReducers<State>(
  {
    morphology: morphologyReducer
  }
);

const store = createStore<State, AnyAction, {}, {}>(rootReducer, {} as State, composeWithDevTools(applyMiddleware(thunk)));

export default store;