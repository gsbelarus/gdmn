import { combineReducers, Reducer } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { getType } from 'typesafe-actions';

import { TActions } from '@src/app/store/TActions';
import { IAuthState, getReducer as getAuthReducer } from '@src/app/scenes/auth/reducer';
import { IRootState, reducer as rootReducer } from '@src/app/scenes/root/reducer';
// import { TDataStoresState, dataStoresReducer } from '@src/app/scenes/datastores/reducer';
import { authActions } from '@src/app/scenes/auth/actions';
// import { backupsReducer, IBackupsState } from '@src/app/scenes/backups/reducer';

interface IState {
  readonly rootState: IRootState;
  readonly authState: IAuthState;
  readonly form: any;
  // readonly dataStoresState: TDataStoresState;
  // readonly backupsState: IBackupsState;
}

const getReducer = () => {
  const reducer = combineReducers<IState>({
    rootState: rootReducer,
    authState: getAuthReducer(),
    form: formReducer // todo: move to auth
    // dataStoresState: dataStoresReducer,
    // ermodelState: ermodelReducer,
    // backupsState: backupsReducer
  });

  // reset state to initial
  const enhacedReducer = (state: IState | undefined, action: TActions) =>
    reducer(action.type === getType(authActions.signOut) ? undefined : state, action);

  return enhacedReducer;
};

type TReducer = Reducer<IState, TActions>;

// tslint:disable-next-line no-default-export
export default getReducer; // TODO test hmr require without default
export { TReducer, IState };
