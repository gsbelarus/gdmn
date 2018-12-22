import { combineReducers, Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { TActions } from '@src/app/store/TActions';
import { _IAuthState, IAuthState, reducer as authReducer } from '@src/app/scenes/auth/reducer';
import { IRootState, reducer as rootReducer } from '@src/app/scenes/root/reducer';
import { reducer as gdmnReducer, TGdmnState } from '@src/app/scenes/gdmn/reducer';
import { authActions } from '@src/app/scenes/auth/actions';
import { recordSetReducer, RecordSetReducerState } from 'gdmn-recordset';
import { gridReducer, GridReducerState } from 'gdmn-grid';
import persistLocalStorage from 'redux-persist/lib/storage';
import { PersistPartial, persistReducer } from 'redux-persist';

import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';

initializeIcons(/* optional base url */);

interface IState {
  readonly rootState: IRootState;
  readonly authState: IAuthState;
  readonly gdmnState: TGdmnState;
  readonly recordSet: RecordSetReducerState;
  readonly grid: GridReducerState;
}

const authPersistConfig = {
  key: 'gdmn::root::authState',
  storage: persistLocalStorage,
  whitelist: ['authenticated', 'accessTokenPayload', 'refreshTokenPayload', 'accessToken', 'refreshToken']
};

const reducer = combineReducers<IState>({
  rootState: rootReducer,
  gdmnState: gdmnReducer,
  authState: persistReducer(authPersistConfig, (state: _IAuthState | undefined, action: TActions) => {
    /*
     workaround for nested persist
     see: https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
    */
    if (action.type === getType(authActions.signOut) || action.type === getType(gdmnActions.apiDeleteAccount)) {
      persistLocalStorage.removeItem(`persist:gdmn::root::authState`);
    }

    return authReducer(
      action.type === getType(authActions.signOut) || action.type === getType(gdmnActions.apiDeleteAccount)
        ? undefined  /* reset state to initial*/
        : state,
      action
    )
  }),
  recordSet: recordSetReducer,
  grid: gridReducer
});

const enhacedReducer = (state: IState | undefined, action: TActions) =>
  reducer(
    action.type === getType(authActions.signOut) || action.type === getType(gdmnActions.apiDeleteAccount)
      ? undefined  /* reset state to initial*/
      : state,
    action
  );

type TReducer = Reducer<IState  & PersistPartial, TActions>;

// tslint:disable-next-line no-default-export
export default enhacedReducer; // TODO test hmr require without default
export { TReducer, IState };
