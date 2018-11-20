import { compose, withProps } from 'recompose';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { IAccessTokenPayload, IRefreshTokenPayload, TUserRoleType } from '@gdmn/server-api';
import { Auth } from '@gdmn/client-core';

import { IState } from '@src/app/store/reducer';
import { authActions } from '@src/app/scenes/auth/actions';
import { ISignInFormData, ISignInFormProps, SignInForm } from '@src/app/scenes/auth/components/SignInForm';
import { AuthView, IAuthViewProps, IAuthViewStateProps } from '@src/app/scenes/auth/component';
import { ISignUpFormData, ISignUpFormProps, SignUpForm } from '@src/app/scenes/auth/components/SignUpForm';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';

/* demo user */
const signInFormInitialValues: ISignInFormData = { username: 'Administrator', password: 'Administrator' };

const getSignInFormContainer = (apiService: GdmnPubSubApi) =>
  compose<ISignInFormProps, ISignInFormProps>(
    connect(
      state => ({
        initialValues: signInFormInitialValues
      }),
      (dispatch, ownProps) => ({
        onSubmit: async (formData: Partial<ISignInFormData>) => {
          // todo: async action

          dispatch(authActions.signInAsync.request());

          try {
            const response: any = await apiService.signIn({
              payload: {
                // 'app-uid'
                'create-user': 0,
                login: formData.username || '',
                passcode: formData.password || ''
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
    ),
    reduxForm<ISignInFormData>({
      form: 'SignInForm'
    })
  )(SignInForm);

const getSignUpFormContainer = (apiService: GdmnPubSubApi) =>
  compose<ISignUpFormProps, ISignUpFormProps>(
    connect(
      null,
      (dispatch, ownProps) => ({
        onSubmit: async (formData: Partial<ISignUpFormData>) => {
          // todo: async action

          dispatch(authActions.signUpAsync.request());

          try {
            const response = await apiService.signUp({
              payload: {
                // 'app-uid'
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
    ),
    reduxForm<ISignUpFormData>({
      form: 'SignUpForm'
    })
  )(SignUpForm);

const getAuthContainer = (apiService: GdmnPubSubApi) =>
  compose<IAuthViewProps, IAuthViewProps>(
    connect(
      (state: IState, ownProps: IAuthViewProps): IAuthViewStateProps => ({
        signInFormSubmitting: state.form && state.form.SignInForm ? state.form.SignInForm.submitting : false,
        signUpFormSubmitting: state.form && state.form.SignUpForm ? state.form.SignUpForm.submitting : false
      })
    ),
    withProps({
      renderSignInFormContainer: getSignInFormContainer(apiService),
      renderSignUpFormContainer: getSignUpFormContainer(apiService)
    })
  )(AuthView);

export { getAuthContainer };
