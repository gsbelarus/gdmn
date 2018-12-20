import { getType } from 'typesafe-actions';

import { rootActions, TRootActions } from '@src/app/scenes/root/actions';

interface IRootState {
  // refererPath?: string;
  errorMsgBarText?: string;
}

const initialState: IRootState = {
  errorMsgBarText: ''
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
        errorMsgBarText: action.payload
      };
    }
    case getType(rootActions.hideMessage): {
      return {
        ...state,
        errorMsgBarText: ''
      };
    }
    default:
      return state;
  }
}

export { reducer, IRootState };
