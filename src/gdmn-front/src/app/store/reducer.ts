import { combineReducers, Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { TActions } from '@src/app/store/TActions';
import { IAuthState, getReducer as getAuthReducer } from '@src/app/scenes/auth/reducer';
import { IRootState, reducer as rootReducer } from '@src/app/scenes/root/reducer';
import { IGdmnState, reducer as gdmnReducer } from '@src/app/scenes/gdmn/reducer';
import { authActions } from '@src/app/scenes/auth/actions';
import { RecordSetReducerState, recordSetReducer } from 'gdmn-recordset';
import { GridReducerState, gridReducer } from 'gdmn-grid';

interface IState {
  readonly rootState: IRootState;
  readonly authState: IAuthState;
  readonly gdmnState: IGdmnState;
  readonly recordSet: RecordSetReducerState;
  readonly grid: GridReducerState;
}

const getReducer = () => {
  const reducer = combineReducers<IState>({
    rootState: rootReducer,
    gdmnState: gdmnReducer,
    authState: getAuthReducer(),
    recordSet: recordSetReducer,
    grid: gridReducer
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
