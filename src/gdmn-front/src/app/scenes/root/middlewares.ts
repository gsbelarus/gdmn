import { Middleware } from 'redux';

import { selectRootState } from '@src/app/store/selectors';
import { rootActions } from '@src/app/scenes/root/actions';

const errorMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  if (
    action.payload &&
    /* support not fsa-compliant redux actions (without action.error) see: piotrwitek/typesafe-actions#52 */
    (action.error || action.payload instanceof Error)
  ) {
    let errorMsg = (<Error>action.payload).message;

    // if (action.payload instanceof SyntaxError) {
    //   // todo: custom response parse error
    //   errorMsg = '[client internal error]';
    //   //-//console.log(action.payload);
    // }
    // todo: on server UnauthorizedError -> signOut

    if (selectRootState(getState()).errorMsgBarText !== '') {
      /* snackbar opened */
      if (errorMsg !== selectRootState(getState()).errorMsgBarText) {
        errorMsg += '  \n  ' + selectRootState(getState()).errorMsgBarText;
      }
      selectRootState(getState()).errorMsgBarText = errorMsg; // todo action
    } else {
      dispatch(rootActions.showMessage(errorMsg || action.type));
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
