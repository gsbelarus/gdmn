import { getType } from 'typesafe-actions';
import { Middleware } from 'redux';
import { startSubmit, stopSubmit } from 'redux-form';

import { authActions } from '@src/app/scenes/auth/actions';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';

const getSignInUpMiddleware = (reduxFormKey: string): Middleware => ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case getType(authActions.signUpAsync.request):
    case getType(authActions.signInAsync.request):
      dispatch(startSubmit(reduxFormKey));

      break;
    case getType(authActions.signUpAsync.success):
    case getType(authActions.signInAsync.success):
      // dispatch(reset(reduxFormKey)); // todo
      dispatch(stopSubmit(reduxFormKey));

      break;
    case getType(authActions.signUpAsync.failure):
    case getType(authActions.signInAsync.failure):
      // dispatch(reset(reduxFormKey));
      dispatch(stopSubmit(reduxFormKey));

      break;
  }

  return next(action);
};

const signInMiddleware: Middleware = getSignInUpMiddleware('SignInForm');

const signUpMiddleware: Middleware = getSignInUpMiddleware('SignUpForm');

const signOutMiddleware: Middleware = ({ dispatch, getState }) => next => (action: any) => {
  if (action.type === getType(authActions.signOut)) {
    dispatch(gdmnActions.apiDisconnect());
  }

  return next(action);
};

const authMiddlewares: Middleware[] = [signUpMiddleware, signInMiddleware, signOutMiddleware];

export { authMiddlewares };
