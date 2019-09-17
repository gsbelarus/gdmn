import { applyMiddleware, compose, createStore, Middleware, Store } from 'redux';
//import { createLogger } from 'redux-logger';
// @ts-ignore
import { persistReducer } from 'redux-persist';
// @ts-ignore
import { IState, TReducer } from '@src/app/store/reducer';
// @ts-ignore
import { TActions } from '@src/app/store/TActions';
// @ts-ignore
import { persistConfig } from '@src/app/store/store';

// https://github.com/zalmoxisus/redux-devtools-extension
const devCompose =
  typeof window === 'object' && (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const devMiddlewares: Middleware[] = [
  /*
  createLogger({
    collapsed: () => true,
    predicate: (getState, action) =>
      !(
        action.type.slice(0, 'RECORDSET'.length) === 'RECORDSET' ||
        action.type.slice(0, 'GRID'.length) === 'GRID' ||
        action.type.slice(0, 'root/stompLogPanel/ADD_MESSAGE'.length) === 'root/stompLogPanel/ADD_MESSAGE'
      )
  })
  */
];

function configureStore(persistedReducer: TReducer, middlewares: Middleware[] = [], initialState?: IState) {
  const store = createStore<IState, TActions, any, any>(
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

  return store as Store<IState, TActions>;
}

export { configureStore };
