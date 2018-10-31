import { createStore, combineReducers, applyMiddleware, AnyAction } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { reducer, State as AppState } from './reducer';
import thunk from 'redux-thunk';
import { gridReducer, GridReducerState } from 'gdmn-grid';
import { RecordSetReducerState, recordSetReducer } from 'gdmn-recordset';

export interface State {
  appState: AppState;
  grid: GridReducerState;
  recordSet: RecordSetReducerState;
};

const rootReducer = combineReducers<State>(
  {
    appState: reducer,
    grid: gridReducer,
    recordSet: recordSetReducer
  }
);

const store = createStore<State, AnyAction, {}, {}>(rootReducer, {} as State, composeWithDevTools(applyMiddleware(thunk)));

export default store;