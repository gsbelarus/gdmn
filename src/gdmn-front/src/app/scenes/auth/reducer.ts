import { getType } from 'typesafe-actions';
import { IAccessTokenPayload, IRefreshTokenPayload } from '@gdmn/server-api';

import { authActions, TAuthActions } from '@src/app/scenes/auth/actions';

interface IAuthState {
  authenticated: boolean; // todo: selector
  accessTokenPayload?: IAccessTokenPayload;
  accessToken?: string;
  refreshToken?: string;
  // todo: sessionId
}

// todo: persist
const initialState: IAuthState = {
  authenticated: false
};

const getReducer = () => (state: IAuthState = initialState, action: TAuthActions) => {
  switch (action.type) {
    case getType(authActions.signUpAsync.success):
    case getType(authActions.signInAsync.success): {
      return {
        ...state,
        ...action.payload,
        accessTokenPayload:
          action.payload.accessTokenPayload || state.accessTokenPayload
            ? {
                ...state.accessTokenPayload,
                ...action.payload.accessTokenPayload
              }
            : undefined,
        authenticated: true
      };
    }
    case getType(authActions.signUpAsync.failure):
    case getType(authActions.signInAsync.failure):
    case getType(authActions.signOut): {
      return {
        ...state,
        accessTokenPayload: undefined,
        accessToken: undefined,
        refreshToken: undefined,
        // sessionId: undefined,

        authenticated: false
      };
    }
    default:
      return state;
  }
};

export { IAuthState, getReducer };
