import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { authActionsAsync } from '@src/app/scenes/auth/actions';
import { IState } from '@src/app/store/reducer';
import { selectAuthState } from '@src/app/store/selectors';
import { ISignInBoxStateProps, SignInBox } from './components/SignInBox';

export const SignInBoxContainer = connect(
  (state: IState): ISignInBoxStateProps => ({
    signInInitialValues: selectAuthState(state).signInInitialValues!,
    signInRequesting: selectAuthState(state).signInRequesting!,
    signUpRequesting: selectAuthState(state).signUpRequesting!
  }),
  dispatch => ({
    onSignIn: bindActionCreators(authActionsAsync.signIn, dispatch),
    onSignUp: bindActionCreators(authActionsAsync.signUp, dispatch)
  })
)(SignInBox);
