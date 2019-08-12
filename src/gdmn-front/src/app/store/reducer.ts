import { combineReducers, Reducer } from 'redux';
import { getType } from 'typesafe-actions';
// @ts-ignore
import persistLocalStorage from 'redux-persist/lib/storage';
// @ts-ignore
import { PersistPartial, persistReducer } from 'redux-persist';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import { recordSetReducer, RecordSetReducerState } from 'gdmn-recordset';
import { gridReducer, GridReducerState } from 'gdmn-grid';
import { TActions } from '@src/app/store/TActions';
import { IAuthState, reducer as authReducer } from '@src/app/scenes/auth/reducer';
import { IRootState, reducer as rootReducer } from '@src/app/scenes/root/reducer';
import { reducer as gdmnReducer, TGdmnState } from '@src/app/scenes/gdmn/reducer';
import { reducer as fsmReducer, IFSMState } from '@src/app/fsm/reducer';
import { authActions } from '@src/app/scenes/auth/actions';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { IRsMetaState, rsMetaReducer } from './rsmeta';
import { themes } from '../scenes/themeeditor/themes';
import { loadTheme } from 'office-ui-fabric-react';

initializeIcons(/* optional base url */);

export interface IState {
  readonly rootState: IRootState;
  readonly authState: IAuthState;
  readonly gdmnState: TGdmnState;
    readonly recordSet: RecordSetReducerState;
  readonly rsMeta: IRsMetaState;
  readonly grid: GridReducerState;
  readonly fsm: IFSMState;
}

const authPersistConfig = {
  key: 'gdmn::root::authState',
  storage: persistLocalStorage,
  whitelist: ['application', 'authenticated', 'accessTokenPayload', 'refreshTokenPayload', 'accessToken', 'refreshToken']
};

const gdmnStatePersistConfig = {
  key: 'gdmn::root::gdmnState',
  storage: persistLocalStorage,
  whitelist: ['theme'],
  migrate: (state: TGdmnState) => {
    const namedTheme = themes.find( t => t.name === state.theme );

    if (namedTheme) {
      loadTheme(namedTheme.theme);
    }

    return Promise.resolve(state);
  }
};

function withReset(reducer: any) {
  return (state: any, action: any) =>
    reducer(
      action.type === getType(authActions.onSignOut) || action.type === getType(gdmnActions.onApiDeleteAccount)
        ? undefined /* reset state to initial*/
        : state,
      action
    );
}

const reducer = combineReducers<IState>({
  rootState: withReset(rootReducer),
  gdmnState: persistReducer(gdmnStatePersistConfig, withReset(gdmnReducer)),
  authState: persistReducer(authPersistConfig, withReset(authReducer)),
  recordSet: withReset(recordSetReducer),
  rsMeta: withReset(rsMetaReducer),
  grid: withReset(gridReducer),
  fsm: withReset(fsmReducer)
});

export type TReducer = Reducer<IState & PersistPartial, TActions>;

// tslint:disable-next-line no-default-export
export default reducer; // TODO test hmr require without default
