import { applyMiddleware, compose, createStore, Middleware } from 'redux';

import { IState, TReducer } from '@src/app/store/reducer';

function configureStore(rootReducer: TReducer, middlewares: Middleware[] = [], initialState?: IState) {
  return createStore(rootReducer, initialState!, compose(applyMiddleware(...middlewares)));
}

export { configureStore };
