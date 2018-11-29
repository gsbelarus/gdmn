import { connect } from 'react-redux';
import { IAccessTokenPayload, IRefreshTokenPayload, TUserRoleType } from '@gdmn/server-api';
import { Auth } from '@gdmn/client-core';
import { authActions } from '@src/app/scenes/auth/actions';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { ISignInBoxData, SignInBox } from './components/SignInBox';

const signInBoxInitialValues: ISignInBoxData = { userName: 'Administrator', password: 'Administrator' };

export const getSignInBoxContainer = (apiService: GdmnPubSubApi) =>
  connect(
    _state => ({
      initialValues: signInBoxInitialValues
    }),
    dispatch => ({
      onSignIn: async (data: ISignInBoxData) => {
        dispatch(authActions.signInAsync.request());

        try {
          const response: any = await apiService.signIn({
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
            authActions.signInAsync.success({
              refreshTokenPayload,
              accessTokenPayload,
              accessToken: response.payload['access-token'] || '',
              refreshToken: response.payload['refresh-token'] || ''
            })
          );
        } catch (error) {
          console.log('[GDMN] ', error);
          dispatch(authActions.signInAsync.failure(error));
        }
      }
    })
  )(SignInBox);

/*
onSignUp: async (formData: Partial<ISignUpFormData>) => {
  // todo: async action

  dispatch(authActions.signUpAsync.request());

  try {
    const response = await apiService.signUp({
      payload: {
        'create-user': 1,
        login: formData.username || '',
        passcode: formData.password || ''
      }
    });

    const refreshTokenPayload = Auth.decodeToken<IRefreshTokenPayload>(response.payload['refresh-token']);
    const accessTokenPayload = Auth.decodeToken<IAccessTokenPayload>(response.payload['access-token']);
    accessTokenPayload.role = TUserRoleType.USER; // todo: tmp

    dispatch(
      authActions.signUpAsync.success({
        accessTokenPayload,
        refreshTokenPayload,
        accessToken: response.payload['access-token'] || '',
        refreshToken: response.payload['refresh-token'] || ''
      })
    );
  } catch (error) {
    console.log('[GDMN] ', error);
    dispatch(authActions.signUpAsync.failure(error));
  }
}
})
*/
