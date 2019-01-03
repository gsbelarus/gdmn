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
  }),
  addStompLogMessage: createAction('root/stompLogPanel/ADD_MESSAGE', resolve => {
    return (message: string) => resolve(message);
  }),
  setLostConnectWarnOpened: createAction('root/lostConnectWarnMsgBar/SET_OPENED', resolve => {
    return (opened: boolean) => resolve(opened);
  }),
  abortNetReconnect: createAction('root/lostConnectWarnMsgBar/ABORT_NET_RECONNECT', resolve => {
    return () => resolve();
  }),
  netReconnect: createAction('root/connectBtn/NET_RECONNECT', resolve => {
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

export { rootActions, TRootActions };
