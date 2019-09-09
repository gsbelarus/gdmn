import { persistReducer, persistStore } from 'redux-persist';
import persistLocalStorage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist/es/types';
import { configureStore } from '@src/app/store/configureStore';
import reducer, { IState } from '@src/app/store/reducer';
import { getMiddlewares } from '@src/app/store/middlewares';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';

export const persistConfig: PersistConfig<IState> = {
  key: 'gdmn::root',
  storage: persistLocalStorage,
  whitelist: ['theme']
};

export const getStore = (apiService: GdmnPubSubApi) => {
  const persistedReducer = persistReducer(persistConfig, reducer);
  const store = configureStore(persistedReducer, getMiddlewares(apiService));
  const persistor = persistStore(store);

  return { store, persistor };
};