import { ActionType, createAction, createAsyncAction } from 'typesafe-actions';
import { IAccessTokenPayload, IRefreshTokenPayload, TSignInCmdResult, TUserRoleType } from '@gdmn/server-api';
import { Auth } from '@gdmn/client-core';

import { TThunkAction } from '@src/app/store/TActions';
import { ISignInBoxData } from '@src/app/scenes/auth/components/SignInBox';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';

const authActionsAsync = {
  signIn: (data: ISignInBoxData): TThunkAction => async (dispatch, getState, { apiService }) => {
    dispatch(authActions.signIn.request());

    try {
      const response: TSignInCmdResult = await apiService.signIn({
        payload: {
          'create-user': 0,
          login: data.userName,
          passcode: data.password
        }
      });

      const refreshTokenPayload = Auth.decodeToken<IRefreshTokenPayload>(response.payload['refresh-token']);
      const accessTokenPayload = Auth.decodeToken<IAccessTokenPayload>(response.payload['access-token']);
      accessTokenPayload.role = TUserRoleType.USER; // todo: tmp

      dispatch(
        authActions.signIn.success({
          refreshTokenPayload,
          accessTokenPayload,
          accessToken: response.payload['access-token'] || '',
          refreshToken: response.payload['refresh-token'] || ''
        })
      );
    } catch (error) {
      //-//console.log('[GDMN] ', error);
      dispatch(authActions.signIn.failure(error));
    }
  },
  signUp: (data: ISignInBoxData): TThunkAction => async (dispatch, getState, { apiService }) => {
    dispatch(authActions.signUp.request());

    try {
      const response = await apiService.signUp({
        payload: {
          'create-user': 1,
          login: data.userName || '',
          passcode: data.password || ''
        }
      });

      const refreshTokenPayload = Auth.decodeToken<IRefreshTokenPayload>(response.payload['refresh-token']);
      const accessTokenPayload = Auth.decodeToken<IAccessTokenPayload>(response.payload['access-token']);
      accessTokenPayload.role = TUserRoleType.USER; // todo: tmp

      dispatch(
        authActions.signUp.success({
          accessTokenPayload,
          refreshTokenPayload,
          accessToken: response.payload['access-token'] || '',
          refreshToken: response.payload['refresh-token'] || ''
        })
      );
    } catch (error) {
      //-//console.log('[GDMN] ', error);
      dispatch(authActions.signUp.failure(error));
    }
  },
  signOut: (): TThunkAction => async (dispatch, getState, { apiService }) => {
    dispatch(gdmnActions.apiDisconnect());
    dispatch(authActions.onSignOut()); // todo test
  }
};

const authActions = {
  signUp: createAsyncAction('auth/SIGN_UP_REQUEST', 'auth/SIGN_UP_REQUEST_OK', 'auth/SIGN_UP_REQUEST_ERROR')<
    void,
    {
      accessTokenPayload?: IAccessTokenPayload;
      refreshTokenPayload?: IRefreshTokenPayload;
      accessToken?: string;
      refreshToken?: string;
    },
    Error
  >(),
  signIn: createAsyncAction('auth/SIGN_IN_REQUEST', 'auth/SIGN_IN_REQUEST_OK', 'auth/SIGN_IN_REQUEST_ERROR')<
    void,
    {
      accessTokenPayload?: IAccessTokenPayload;
      refreshTokenPayload?: IRefreshTokenPayload;
      accessToken?: string;
      refreshToken?: string;
    },
    Error
  >(),
  onSignOut: createAction('auth/ON_SIGN_OUT')
};

type TAuthActions = ActionType<typeof authActions>;

export { authActions, TAuthActions, authActionsAsync };
