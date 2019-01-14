import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { authActionsAsync } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
import { selectAuthState } from '@src/app/store/selectors';
import { ISignInBoxStateProps, SignInBox } from './components/SignInBox';

export const SignInBoxContainer = connect(
  (state: IState): ISignInBoxStateProps => ({
    signInInitialValues: selectAuthState(state).signInInitialValues!,
    signInRequesting: selectAuthState(state).signInRequesting!
  }),
  dispatch => ({
    onSignIn: bindActionCreators(authActionsAsync.signIn, dispatch)
  })
)(SignInBox);

/*
onSignUp: async (formData: Partial<ISignUpFormData>) => {
  // todo: async action

  dispatch(authActions.signUp.request());

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
}
})
*/
