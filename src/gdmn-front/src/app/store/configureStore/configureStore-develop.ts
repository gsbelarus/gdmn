import { applyMiddleware, compose, createStore, Middleware } from 'redux';
import { createLogger } from 'redux-logger';

import { IState, TReducer } from '@src/app/store/reducer';

// https://github.com/zalmoxisus/redux-devtools-extension
const devCompose =
  typeof window === 'object' && (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const devMiddlewares: Middleware[] = [createLogger()];

function configureStore(rootReducer: TReducer, middlewares: Middleware[] = [], initialState?: IState) {
  const store = createStore(rootReducer, initialState!, devCompose(applyMiddleware(...middlewares, ...devMiddlewares)));

  // webpack HMR for reducers
  if ((<any>module).hot) {
    (<any>module).hot.accept('../reducer', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}

export { configureStore };
