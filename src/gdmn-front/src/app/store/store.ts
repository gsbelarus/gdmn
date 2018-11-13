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
    store = configureStore(
      enhacedReducer,
      getMiddlewares()
      // authStore, apiService
    );

    return store;
  };

export { getStore };
