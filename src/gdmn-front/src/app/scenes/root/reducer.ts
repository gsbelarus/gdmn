import { getType } from 'typesafe-actions';

import { rootActions, TRootActions } from '@src/app/scenes/root/actions';
import { IStompPanelStateProps } from '@src/app/scenes/root/components/StompLogPanel';

interface IRootState extends IStompPanelStateProps {
  // refererPath?: string;
  errorMsgBarText?: string;
  logItems: { message: string }[];
  lostConnectWarnOpened: boolean;
  // disconnectedMode: boolean;
}

const initialState: IRootState = {
  errorMsgBarText: '',
  logItems: [],
  lostConnectWarnOpened: false
  // disconnectedMode: false
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
    case getType(rootActions.addStompLogMessage): {
      return {
        ...state,
        logItems: [
          ...state.logItems,
          { message: action.payload.length > 1000 ? `${action.payload.substr(0, 1000)}...` : action.payload }
        ]
      };
    }
    case getType(rootActions.setLostConnectWarnOpened): {
      return {
        ...state,
        lostConnectWarnOpened: action.payload
      };
    }
    default:
      return state;
  }
}

export { reducer, IRootState };
