import { ERModel, IEntityQueryInspector } from 'gdmn-orm';
import { ActionType, createAction } from 'typesafe-actions';
import { TPingTaskCmd } from '@gdmn/server-api';

const gdmnActions = {
  apiConnect: createAction('gdmn/API_CONNECT', resolve => {
    // TODO async
    return (reconnect: boolean = false) => resolve(reconnect);
  }),

  apiDisconnect: createAction('gdmn/API_DISCONNECT', resolve => {
    // TODO async
    return () => resolve();
  }),

  apiPing: createAction('gdmn/API_PING', resolve => {
    return (cmd: TPingTaskCmd) => resolve(cmd);
  }),

  apiGetSchema: createAction('gdmn/API_GET_SCHEMA', resolve => {
    return () => resolve();
  }),

  apiDeleteAccount: createAction('gdmn/API_DELETE_ACCOUNT', resolve => {
    return () => resolve();
  }),

  apiGetData: createAction('gdmn/API_GET_DATA', resolve => {
    return (queryInspector: IEntityQueryInspector) => resolve(queryInspector);
  }),

  setSchema: createAction('gdmm/SET_SCHEMA', resolve => {
    return (erModel: ERModel) => resolve(erModel);
  }),

  buildCommandList: createAction('gdmn/BUILD_COMMAND_LIST')
};

type TGdmnActions = ActionType<typeof gdmnActions>;

export { gdmnActions, TGdmnActions };
