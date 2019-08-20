import { applyMiddleware, compose, createStore, Middleware, Store } from 'redux';

import { IState, TReducer } from '@src/app/store/reducer';
import { TActions } from '@src/app/store/TActions';

export function configureStore(rootReducer: TReducer, middlewares: Middleware[] = [], initialState?: IState) {
  return createStore<IState, TActions, any, any>(rootReducer, initialState!, compose(applyMiddleware(...middlewares))) as Store<IState, TActions>;
};

