import { ActionType, createAction, createAsyncAction } from 'typesafe-actions';
import { IAccessTokenPayload } from '@gdmn/server-api';

const authActions = {
  signUpAsync: createAsyncAction('auth/SIGN_UP_REQUEST', 'auth/SIGN_UP_REQUEST_OK', 'auth/SIGN_UP_REQUEST_ERROR')<
    void,
    {
      accessTokenPayload?: IAccessTokenPayload;
      accessToken?: string;
      refreshToken?: string;
      // todo: sessionId
    },
    Error
  >(),
  signInAsync: createAsyncAction('auth/SIGN_IN_REQUEST', 'auth/SIGN_IN_REQUEST_OK', 'auth/SIGN_IN_REQUEST_ERROR')<
    void,
    {
      accessTokenPayload?: IAccessTokenPayload;
      accessToken?: string;
      refreshToken?: string;
      // todo: sessionId
    },
    Error
  >(),
  signOut: createAction('auth/SIGN_OUT', resolve => {
    return () => resolve();
  })
  // todo: authAsync
  // todo: refreshAuthAsync
};

type TAuthActions = ActionType<typeof authActions>;

// actions.signInRequestError = (error: Error) => ({
//   type: 'auth/SIGN_IN_REQUEST_ERROR',
//   payload: error,
//   error: true
// });
// actions.signUpRequestError = (error: Error) => ({
//   type: 'auth/SIGN_UP_REQUEST_ERROR',
//   payload: error,
//   error: true
// });

export { authActions, TAuthActions };
