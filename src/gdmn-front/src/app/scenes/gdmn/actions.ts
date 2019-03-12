import { deserializeERModel, ERModel } from 'gdmn-orm';
import { ActionType, createAction } from 'typesafe-actions';
import { TGdmnErrorCodes, TTaskActionNames, TTaskStatus } from '@gdmn/server-api';
import { Auth } from '@gdmn/client-core';

import { TThunkAction } from '@src/app/store/TActions';
import { selectAuthState } from '@src/app/store/selectors';
import { authActionsAsync } from '@src/app/scenes/auth/actions';
import { rootActions } from '@src/app/scenes/root/actions';
import { IViewTab } from './types';

const gdmnActionsAsync = {
  apiActivate: (): TThunkAction => async (dispatch, getState, { apiService }) => {
    apiService.pubSubClient.activateConnection();
  },
  apiDeactivate: (): TThunkAction => async (dispatch, getState, { apiService }) => {
    apiService.pubSubClient.deactivateConnection();
  },
  apiDeleteAccount: (): TThunkAction => async (dispatch, getState, { apiService }) => {
    const accessTokenPayload = selectAuthState(getState()).accessTokenPayload;
    const refreshTokenPayload = selectAuthState(getState()).refreshTokenPayload;
    if (!!accessTokenPayload && !!refreshTokenPayload && Auth.isFreshToken(refreshTokenPayload)) {
      const token = Auth.isFreshToken(accessTokenPayload)
        ? selectAuthState(getState()).accessToken
        : selectAuthState(getState()).refreshToken;

      try {
        await apiService.deleteAccount({
          payload: {
            authorization: token || '',
            'delete-user': 1
          }
        });
      } catch (error) {
        // if (error instanceof GdmnPubSubError) {
        if (error.errorData.code === TGdmnErrorCodes.UNAUTHORIZED) {
          dispatch(authActionsAsync.signOut());
        } else {
          dispatch(rootActions.onError(error));
        }
        // } else {
        //   dispatch(rootActions.onError(new Error(error)));
        // }
      }
    } else {
      dispatch(authActionsAsync.signOut());
    }

    dispatch(gdmnActions.onApiDeleteAccount); // todo test
  },
  apiGetSchema: (): TThunkAction => async (dispatch, getState, { apiService }) => {
    const value = await apiService.getSchema({withAdapter: true});
    if (value.payload.status === TTaskStatus.SUCCESS) {
      const erModel = deserializeERModel(value.payload.result!);
      dispatch(gdmnActions.setSchema(erModel));
    }
  }
};

const gdmnActions = {
  apiConnect: createAction('gdmn/API_CONNECT', resolve => {
    return (reconnect: boolean = false) => resolve(reconnect);
  }),

  apiDisconnect: createAction('gdmn/API_DISCONNECT', resolve => {
    return () => resolve();
  }),

  onApiDeleteAccount: createAction('gdmn/ON_API_DELETE_ACCOUNT', resolve => {
    return () => resolve();
  }),

  setSchema: createAction('gdmm/SET_SCHEMA', resolve => {
    return (erModel: ERModel) => resolve(erModel);
  }),

  setLoading: createAction('gdmm/SET_LOADING', resolve => {
    return (loading: boolean, message?: string) => resolve({ loading, message });
  }),

  buildCommandList: createAction('gdmn/BUILD_COMMAND_LIST'),

  addViewTab: createAction('gdmn/ADD_VIEW_TAB', resolve => {
    return (viewTab: IViewTab) => resolve(viewTab);
  }),

  updateViewTab: createAction('gdmn/UPDATE_VIEW_TAB', resolve => {
    return (viewTab: IViewTab) => resolve(viewTab);
  }),

  deleteViewTab: createAction('gdmn/DELETE_VIEW_TAB', resolve => {
    return (viewTab: IViewTab) => resolve(viewTab);
  }),

  showInspector: createAction('gdmm/SHOW_INSPECTOR_FORM', resolve => {
    return (showInspector: boolean) => resolve(showInspector);
  }),
};

type TGdmnActions = ActionType<typeof gdmnActions>;

export { gdmnActions, TGdmnActions, gdmnActionsAsync };
