import { persistReducer, persistStore } from 'redux-persist';
import persistLocalStorage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist/es/types';

import { configureStore } from '@src/app/store/configureStore';
import reducer from '@src/app/store/reducer';
import { getMiddlewares } from '@src/app/store/middlewares';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';

const persistConfig: PersistConfig = {
  key: 'gdmn::root',
  storage: persistLocalStorage,
  whitelist: [],
  timeout: 1000
};

const getStore = (apiService: GdmnPubSubApi) => {
  const persistedReducer = persistReducer(persistConfig, reducer);
  const store = configureStore(persistedReducer, getMiddlewares(apiService));
  const persistor = persistStore(store);

  return { store, persistor };
};

export { getStore, persistConfig };
