import { ActionType, createAction } from 'typesafe-actions';

const rootActions = {
  onError: createAction('root/ON_ERROR', resolve => {
    return (error: Error, meta?: any) => resolve(error, meta);
  }),
  showMessage: createAction('root/snackbar/SHOW_MESSAGE', resolve => {
    return (message: string) => resolve(message);
  }),
  hideMessage: createAction('root/snackbar/HIDE_MESSAGE', resolve => {
    return () => resolve();
  })
  // onNotAuthorizedAccess: createAction('root/ON_NOT_AUTHORIZED_ACCESS', resolve => {
  //   return (refererPath: string) => resolve(refererPath);
  // }),
  // onAccessDenied: createAction('root/ON_ACCESS_DENIED', resolve => {
  //   return (refererPath: string) => resolve(refererPath);
  // }),
  // redirect: createAction('root/REDIRECT', resolve => {
  //   return (toPath: string) => resolve(toPath);
  // })
};

type TRootActions = ActionType<typeof rootActions>;

// rootActions.onError = (error: Error, meta?: any) => ({ type: 'ON_ERROR', payload: error, error: true, meta });

export { rootActions, TRootActions };
