import { getType } from 'typesafe-actions';
import { Middleware } from 'redux';
import { startSubmit, stopSubmit } from 'redux-form';

import { authActions } from '@src/app/scenes/auth/actions';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';

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

      // todo: test error snackbar

      // if (action.payload && action.payload.fields) {
      //   throw new SubmissionError( { [action.payload.fieldName]:  action.payload.toString() } );
      //   action.payload.message = action.payload.toString();
      // } else if (action.payload instanceof UnauthorizedError) {
      //   action.payload.message = 'Invalid username or password!';
      // }

      break;
  }

  return next(action);
};

const signInMiddleware: Middleware = getSignInUpMiddleware('SignInForm');

const signUpMiddleware: Middleware = getSignInUpMiddleware('SignUpForm');

const getSignOutMiddleware = (apiService: GdmnPubSubApi): Middleware => ({ dispatch, getState }) => next => async (
  action: any
) => {
  if (action.type === getType(authActions.signOut)) {
    await apiService.signOut({ payload: null });
  }

  return next(action);
};

const getAuthMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [
  signUpMiddleware,
  signInMiddleware,
  getSignOutMiddleware(apiService)
];

export { getAuthMiddlewares };
