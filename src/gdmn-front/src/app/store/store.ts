import { persistStore, persistReducer } from 'redux-persist';
import persistLocalStorage from 'redux-persist/lib/storage';

import { configureStore } from '@src/app/store/configureStore';
import getReducer from '@src/app/store/reducer';
import { getMiddlewares } from '@src/app/store/middlewares';
// import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';

const getStore = () =>
  // authInitialState: IAuthState
  // authStore: Auth, apiService: GdmnPubSubApi
  {
    const reducer = getReducer();
    let store = configureStore(
      reducer,
      getMiddlewares()
      // authStore, apiService
    );

    const enhacedReducer = (state: any, action: any) => reducer(action.type === 'SIGN_OUT' ? undefined : state, action);
    const persistConfig = {
      key: 'gdmn::authState',
      storage: persistLocalStorage,
      whitelist: ['authState']
    };
    const persistedReducer = persistReducer(persistConfig, enhacedReducer);

    store = configureStore(
      persistedReducer,
      getMiddlewares()
      // authStore, apiService
    );

    const persistor = persistStore(store);

    return { store, persistor };
  };

export { getStore };
