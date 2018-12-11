import { applyMiddleware, compose, createStore, Middleware } from 'redux';
import { createLogger } from 'redux-logger';

import { IState, TReducer } from '@src/app/store/reducer';

// https://github.com/zalmoxisus/redux-devtools-extension
const devCompose =
  typeof window === 'object' && (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

/**
 * я пока закоментировал логер, потому что с экшенами рекордсета/грида всё
 * становится адски медленно.
 *
 * я для отладки использую Redux Dev Tools в браузере.
 *
 * там есть в том числе и лог и работает он быстрее чем этот логер,
 * который все пихает в консоль.
 */
const devMiddlewares: Middleware[] = [
  /*createLogger()*/
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
