import { getType } from 'typesafe-actions';
import { IAccessTokenPayload, IRefreshTokenPayload } from '@gdmn/server-api';

import { authActions, TAuthActions } from '@src/app/scenes/auth/actions';
import { ISignInBoxStateProps } from '@src/app/scenes/auth/components/SignInBox';

interface IAuthState extends ISignInBoxStateProps {
  authenticated: boolean;
  accessTokenPayload?: IAccessTokenPayload;
  refreshTokenPayload?: IRefreshTokenPayload;
  accessToken?: string;
  refreshToken?: string;
  // tmp
  signUpRequesting: boolean;
}

const initialState: IAuthState = {
  signUpRequesting: false,
  signInRequesting: false,
  signInInitialValues: { userName: 'Administrator', password: 'Administrator' },
  authenticated: false
};

const getReducer = () => (state: IAuthState = initialState, action: TAuthActions) => {
  switch (action.type) {
    case getType(authActions.signInAsync.request): {
      return {
        ...state,
        signInRequesting: true,
      };
    }
    case getType(authActions.signUpAsync.request): {
      return {
        ...state,
        signUpRequesting: true,
      };
    }
    case getType(authActions.signUpAsync.success):
    case getType(authActions.signInAsync.success): {
      return {
        ...state,
        ...action.payload,
        accessTokenPayload:
          action.payload.accessTokenPayload || state.accessTokenPayload
            ? <IAccessTokenPayload>{
                ...state.accessTokenPayload,
                ...action.payload.accessTokenPayload
              }
            : undefined,
        refreshTokenPayload:
          action.payload.refreshTokenPayload || state.refreshTokenPayload
            ? <IRefreshTokenPayload>{
                ...state.refreshTokenPayload,
                ...action.payload.refreshTokenPayload
              }
            : undefined,

        authenticated: true,

        signUpRequesting: false,
        signInRequesting: false
      };
    }
    case getType(authActions.signUpAsync.failure):
    case getType(authActions.signInAsync.failure):
    case getType(authActions.signOut): {
      return {
        ...state,
        accessTokenPayload: undefined,
        accessToken: undefined,
        refreshTokenPayload: undefined,
        refreshToken: undefined,

        authenticated: false,

        signUpRequesting: false,
        signInRequesting: false
      };
    }
    default:
      return state;
  }
};

export { IAuthState, getReducer };
