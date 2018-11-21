import { ActionType, createAction, createAsyncAction } from 'typesafe-actions';
import { IAccessTokenPayload, IRefreshTokenPayload } from '@gdmn/server-api';

const authActions = {
  signUpAsync: createAsyncAction('auth/SIGN_UP_REQUEST', 'auth/SIGN_UP_REQUEST_OK', 'auth/SIGN_UP_REQUEST_ERROR')<
    void,
    {
      accessTokenPayload?: IAccessTokenPayload;
      refreshTokenPayload?: IRefreshTokenPayload;
      accessToken?: string;
      refreshToken?: string;
    },
    Error
  >(),
  signInAsync: createAsyncAction('auth/SIGN_IN_REQUEST', 'auth/SIGN_IN_REQUEST_OK', 'auth/SIGN_IN_REQUEST_ERROR')<
    void,
    {
      accessTokenPayload?: IAccessTokenPayload;
      refreshTokenPayload?: IRefreshTokenPayload;
      accessToken?: string;
      refreshToken?: string;
    },
    Error
  >(),
  signOut: createAction('auth/SIGN_OUT', resolve => {
    return () => resolve();
  })
};

type TAuthActions = ActionType<typeof authActions>;

export { authActions, TAuthActions };
