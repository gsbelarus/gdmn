import { persistStore, persistReducer } from 'redux-persist';
import persistLocalStorage from 'redux-persist/lib/storage';
import { getType } from 'typesafe-actions';

import { configureStore } from '@src/app/store/configureStore';
import getReducer from '@src/app/store/reducer';
import { getMiddlewares } from '@src/app/store/middlewares';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { authActions } from '@src/app/scenes/auth/actions';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';

const getStore = (apiService: GdmnPubSubApi) => {
  const reducer = getReducer();

  const enhacedReducer = (state: any, action: any) =>
    reducer(
      action.type === getType(authActions.signOut) || action.type === getType(gdmnActions.apiDeleteAccount)
        ? undefined
        : state,
      action
    );

  const persistConfig = {
    key: 'gdmn::authState',
    storage: persistLocalStorage,
    whitelist: ['authState']
  };
  const persistedReducer = persistReducer(persistConfig, enhacedReducer); //<any, TActions>

  // @ts-ignore
  const store = configureStore(persistedReducer, getMiddlewares(apiService));
  const persistor = persistStore(store);

  return { store, persistor };
};

export { getStore };
