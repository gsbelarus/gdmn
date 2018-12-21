import { IState } from '@src/app/store/reducer';

const selectRootState = ({ rootState }: IState) => rootState;
const selectAuthState = ({ authState }: IState) => authState;
const selectGdmnState = ({ gdmnState }: IState) => gdmnState;

export { selectRootState, selectAuthState, selectGdmnState };
