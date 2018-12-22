import { applyMiddleware, compose, createStore, Middleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistReducer } from 'redux-persist';

import { IState, TReducer } from '@src/app/store/reducer';
import { TActions } from '@src/app/store/TActions';
import { persistConfig } from '@src/app/store/store';

// https://github.com/zalmoxisus/redux-devtools-extension
const devCompose =
  typeof window === 'object' && (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const devMiddlewares: Middleware[] = [
  createLogger({
    collapsed: () => true,
    predicate: (getState, action) =>
      !(action.type.slice(0, 'RECORDSET'.length) === 'RECORDSET' || action.type.slice(0, 'GRID'.length) === 'GRID')
  })
];

function configureStore(persistedReducer: TReducer, middlewares: Middleware[] = [], initialState?: IState) {
  const store = createStore(
    persistedReducer,
    initialState!,
    devCompose(applyMiddleware(...middlewares, ...devMiddlewares))
  );

  /* webpack HMR for reducers */
  //(<any>module).hot.accept('../reducer', () => {
  //   store.replaceReducer(rootReducer);
  // });

  /**
   * https://github.com/rt2zz/redux-persist/blob/master/docs/hot-module-replacement.md
   */
  if ((<any>module).hot) {
    const nextReducer = require('../reducer').default;

    const nextPersistedReducer = persistReducer<IState, TActions>(persistConfig, nextReducer);
    store.replaceReducer(nextPersistedReducer);
  }

  return store;
}

export { configureStore };
