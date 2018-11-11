import { getType } from 'typesafe-actions';

import { rootActions, TRootActions } from '@src/app/scenes/root/actions';

interface IRootState {
  // refererPath?: string;
  snackbarMessage?: string;
}

const initialState: IRootState = {
  snackbarMessage: ''
};

function reducer(state: IRootState = initialState, action: TRootActions) {
  switch (action.type) {
    // case getType(rootActions.onAccessDenied):
    // case getType(rootActions.onNotAuthorizedAccess): {
    //   return {
    //     ...state,
    //     refererPath: action.payload
    //   };
    // }
    case getType(rootActions.showMessage): {
      return {
        ...state,
        snackbarMessage: action.payload
      };
    }
    case getType(rootActions.hideMessage): {
      return {
        ...state,
        snackbarMessage: ''
      };
    }
    default:
      return state;
  }
}

export { reducer, IRootState };
