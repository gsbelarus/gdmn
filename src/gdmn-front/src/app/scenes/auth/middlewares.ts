import { getType } from 'typesafe-actions';
import { Middleware } from 'redux';

import { authActions } from '@src/app/scenes/auth/actions';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';

const signOutMiddleware: Middleware = ({ dispatch, getState }) => next => (action: any) => {
  if (action.type === getType(authActions.signOut)) {
    dispatch(gdmnActions.apiDisconnect());
  }

  return next(action);
};

const authMiddlewares: Middleware[] = [signOutMiddleware];

export { authMiddlewares };
