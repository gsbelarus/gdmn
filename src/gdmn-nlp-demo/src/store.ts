import { combineReducers, createStore, AnyAction, applyMiddleware } from "redux";
import { reducer as morphologyReducer, IMorphologyState } from './morphology/reducer';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

export interface State {
  morphology: IMorphologyState;
};

const rootReducer = combineReducers<State>(
  {
    morphology: morphologyReducer
  }
);

const store = createStore<State, AnyAction, {}, {}>(rootReducer, {} as State, composeWithDevTools(applyMiddleware(thunk)));

export default store;