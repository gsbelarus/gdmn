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
          } catch (errMessage) {
            console.log('[GDMN] ', errMessage);
            dispatch(
              authActions.signInAsync.failure(new Error(errMessage.meta ? errMessage.meta.message : errMessage))
            );
          }
      }
    })
  )(SignInBox);



