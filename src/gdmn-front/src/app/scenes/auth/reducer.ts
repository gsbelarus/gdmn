import { getType } from 'typesafe-actions';
// @ts-ignore
//import { PersistPartial } from 'redux-persist';
import { IAccessTokenPayload, IRefreshTokenPayload, IApplicationInfo } from '@gdmn/server-api';

import { authActions } from '@src/app/scenes/auth/actions';
import { ISignInBoxStateProps } from '@src/app/scenes/auth/components/SignInBox';
import { TActions } from '@src/app/store/TActions';

interface _IAuthState extends ISignInBoxStateProps {
  authenticated: boolean;
  accessTokenPayload?: IAccessTokenPayload;
  refreshTokenPayload?: IRefreshTokenPayload;
  accessToken?: string;
  refreshToken?: string;
  // tmp
  signUpRequesting: boolean;
  application?: IApplicationInfo;
}

type IAuthState = _IAuthState //& PersistPartial;

const initialState: _IAuthState = {
  signUpRequesting: false,
  signInRequesting: false,
  signInInitialValues: { userName: 'Administrator', password: 'Administrator' },
  authenticated: false
};

function reducer(state: _IAuthState = initialState, action: TActions) {
  switch (action.type) {
    case getType(authActions.signIn.request): {
      return {
        ...state,
        signInRequesting: true
      };
    }
    case getType(authActions.signUp.request): {
      return {
        ...state,
        signUpRequesting: true
      };
    }
    case getType(authActions.signUp.success):
    case getType(authActions.signIn.success): {
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
    case getType(authActions.signUp.failure):
    case getType(authActions.signIn.failure):
    case getType(authActions.onSignOut): {
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
    case getType(authActions.setApplication): {
      return {
        ...state,
        application: action.payload
      };
    }
    default:
      return state;
  }
}

export { IAuthState, _IAuthState, reducer };
