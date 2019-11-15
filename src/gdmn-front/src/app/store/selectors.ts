import { IState } from '@src/app/store/reducer';

const selectRootState = ({ rootState }: IState) => rootState;
const selectAuthState = ({ authState }: IState) => authState;
const selectGdmnState = ({ gdmnState }: IState) => gdmnState;
const selectMDGState = ({ mdgState }: IState) => mdgState;

export { selectRootState, selectAuthState, selectGdmnState, selectMDGState };
