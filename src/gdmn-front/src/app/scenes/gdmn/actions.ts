import { ActionType, createAction } from 'typesafe-actions';
import { TPingTaskCmd } from '@gdmn/server-api';

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
    return (cmd: TPingTaskCmd) => resolve(cmd);
  }),
  apiDeleteAccount: createAction('gdmn/API_DELETE_ACCOUNT', resolve => {
    return () => resolve();
  })
};

type TGdmnActions = ActionType<typeof gdmnActions>;

export { gdmnActions, TGdmnActions };
