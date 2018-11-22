import { IState } from '@src/app/store/reducer';
// import { IBackupsState } from '@src/app/scenes/backups/reducer';

// todo: reselect
const selectRootState = ({ rootState }: IState) => rootState;
// const selectDataStoresState = ({ dataStoresState }: IState) => dataStoresState;
const selectAuthState = ({ authState }: IState) => authState;
// const selectBackupsState = ({ backupsState }: IState): IBackupsState => backupsState;

export {
  selectRootState,
  selectAuthState
  // selectDataStoresState,
  // selectBackupsState
};
