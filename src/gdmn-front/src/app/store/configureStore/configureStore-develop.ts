import { applyMiddleware, compose, createStore, Middleware } from 'redux';
import { createLogger } from 'redux-logger';

import { IState, TReducer } from '@src/app/store/reducer';

// https://github.com/zalmoxisus/redux-devtools-extension
const devCompose =
  typeof window === 'object' && (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const devMiddlewares: Middleware[] = [
  createLogger({
    predicate: (getState, action) => !(action.type.slice(0, 'RECORDSET'.length) === 'RECORDSET' || action.type.slice(0, 'GRID'.length) === 'GRID')
  })
];

function configureStore(rootReducer: TReducer, middlewares: Middleware[] = [], initialState?: IState) {
  const store = createStore(rootReducer, initialState!, devCompose(applyMiddleware(...middlewares, ...devMiddlewares))); // fixme // if ((<any>module).hot) {

  /* webpack HMR for reducers */ //   (<any>module).hot.accept('../reducer', () => {
  //     store.replaceReducer(rootReducer);
  //   });
  // }

  return store;
}

export { configureStore };
