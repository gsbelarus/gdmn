import { IState } from '@src/app/store/reducer';
// import { IBackupsState } from '@src/app/scenes/backups/reducer';

// todo: reselect
const selectRootState = ({ rootState }: IState) => rootState;
// const selectMorphologyState = ({ morphologyState }: IState) => morphologyState;
// const selectSemanticsState = ({ semanticsState }: IState) => semanticsState;
// const selectErmodelState = ({ ermodelState }: IState) => ermodelState;
// const selectNLPDialogState = ({ nlpDialogState }: IState) => nlpDialogState;
// const selectDataStoresState = ({ dataStoresState }: IState) => dataStoresState;
const selectAuthState = ({ authState }: IState) => authState;
// const selectBackupsState = ({ backupsState }: IState): IBackupsState => backupsState;

export {
  selectRootState,
  selectAuthState
  // selectMorphologyState,
  // selectSemanticsState,
  // selectErmodelState,
  // selectNLPDialogState,
  // selectDataStoresState,
  // selectBackupsState
};
