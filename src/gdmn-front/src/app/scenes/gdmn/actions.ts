import { ActionType, createAction } from 'typesafe-actions';

// import { IWsMessageEventData } from '@core/@gdmn-api/ws/IWsMessageEventData';

const gdmnActions = {
  apiConnect: createAction('gdmn/API_CONNECT', resolve => {
    // TODO async
    return () => resolve();
  }),
  apiDisconnect: createAction('gdmn/API_DISCONNECT', resolve => {
    // TODO async
    return () => resolve();
  }),
  apiPing: createAction('gdmn/API_PING', resolve => {
    // TODO tmp
    return (cmd: any) => resolve(cmd);
  }),
  apiDeleteAccount: createAction('gdmn/API_DELETE_ACCOUNT', resolve => {
    // TODO tmp
    return () => resolve();
  }),

  stompLog: createAction('gdmn/STOMP_LOG', resolve => {
    // TODO tmp
    return () => resolve();
  })
};

type TGdmnActions = ActionType<typeof gdmnActions>;

export { gdmnActions, TGdmnActions };
