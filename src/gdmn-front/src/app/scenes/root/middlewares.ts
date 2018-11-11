import { Middleware } from 'redux';

import { selectRootState } from '@src/app/store/selectors';
import { rootActions } from '@src/app/scenes/root/actions';

const errorMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  if (
    action.payload &&
    /* support not fsa-compliant redux actions (without action.error) see: piotrwitek/typesafe-actions#52 */
    (action.error || action.payload instanceof Error) // todo: test
  ) {
    let errorMsg = action.payload.toString();

    if (action.payload instanceof SyntaxError) {
      // todo: custom response parse error
      errorMsg = '[client internal error]';
      console.log(action.payload);
    }
    // todo: on server UnauthorizedError -> signOut

    if (selectRootState(getState()).snackbarMessage !== '') {
      /* snackbar opened */
      if (errorMsg !== selectRootState(getState()).snackbarMessage) {
        errorMsg += '  \n  ' + selectRootState(getState()).snackbarMessage;
      }
      selectRootState(getState()).snackbarMessage = errorMsg; // todo: showMessage test
    } else {
      const exludedPrefix = '@@redux-form/';
      if (action.type.slice(0, exludedPrefix.length) !== exludedPrefix) {
        /* open snackbar */
        dispatch(rootActions.showMessage(errorMsg || action.type));
      }
    }
  }

  return next(action);
};

const rootMiddlewares: Middleware[] = [errorMiddleware];

export { rootMiddlewares };

// todo: redirect
// const redirectMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
//     if (action.type === getType(rootActions.redirect)) {
//       const path = action.payload || '/';
//       browserHistory.push(action.payload);
//     }
//     return next(action);
//   };
//
//   return middleware;
// }
