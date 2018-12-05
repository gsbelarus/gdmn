import { IState } from '@src/app/store/reducer';

const selectRootState = ({ rootState }: IState) => rootState;
const selectAuthState = ({ authState }: IState) => authState;

export {
  selectRootState,
  selectAuthState
};
