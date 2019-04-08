import { deserializeERModel, ERModel } from 'gdmn-orm';
import { ActionType, createAction } from 'typesafe-actions';
import { TGdmnErrorCodes, TTaskActionNames, TTaskStatus, TSignInCmdResult, IRefreshTokenPayload, IAccessTokenPayload, TUserRoleType, IApplicationInfo, TTaskActionPayloadTypes } from '@gdmn/server-api';
import { Auth } from '@gdmn/client-core';
import { TThunkAction } from '@src/app/store/TActions';
import { selectAuthState } from '@src/app/store/selectors';
import { authActionsAsync, authActions } from '@src/app/scenes/auth/actions';
import { rootActions } from '@src/app/scenes/root/actions';
import { IViewTab } from './types';
import { ISignInBoxData } from '../auth/components/SignInBox';

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
      const erModel = deserializeERModel(value.payload.result!, true);
      dispatch(gdmnActions.setSchema(erModel));
    }
  },
  apiCreateApp: (payload: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP]): TThunkAction => async (dispatch, getState, { apiService }) => {
    dispatch(gdmnActions.setRunAction({value: true}));
    const app = (await apiService.createApp(payload)).payload.result!;
    if (app) {
      dispatch(gdmnActions.createApp(app));
    }
    dispatch(gdmnActions.setRunAction({ value: false, uid: app.uid }));
  },
  apiDeleteApp: (uid: string): TThunkAction => async (dispatch, getState, { apiService }) => {
    dispatch(gdmnActions.setRunAction({value: true}));
    const response = await apiService.deleteApp({uid});
    switch(response.payload.status) {
      case TTaskStatus.SUCCESS: {
        dispatch(gdmnActions.deleteApp(uid));
        break;
      }
    }
    dispatch(gdmnActions.setRunAction({ value: false, uid: uid }));
  },
  apiGetApps: (): TThunkAction => async (dispatch, getState, { apiService }) => {
    const apps = (await apiService.getApps()).payload.result!;
    if (apps) {
      dispatch(gdmnActions.getApps(apps));
    }
  },
  signIn: (data: ISignInBoxData): TThunkAction => async (dispatch, getState, { apiService }) => {
    dispatch(authActions.signIn.request());

    try {
      const response: TSignInCmdResult = await apiService.signIn({
        payload: {
          'create-user': 0,
          login: data.userName,
          passcode: data.password,
          'app-uid': data.uid
        }
      });

      const refreshTokenPayload = Auth.decodeToken<IRefreshTokenPayload>(response.payload['refresh-token']);
      const accessTokenPayload = Auth.decodeToken<IAccessTokenPayload>(response.payload['access-token']);
      accessTokenPayload.role = TUserRoleType.USER; // todo: tmp

      dispatch(
        authActions.signIn.success({
          refreshTokenPayload,
          accessTokenPayload,
          accessToken: response.payload['access-token'] || '',
          refreshToken: response.payload['refresh-token'] || '',
        })
      );
    } catch (error) {
      //-//console.log('[GDMN] ', error);
      dispatch(authActions.signIn.failure(error));
    }
  },
  signOut: (): TThunkAction => async (dispatch, getState, { apiService }) => {
    dispatch(gdmnActions.apiDisconnect());
    dispatch(authActions.onSignOut()); // todo test
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

  createApp: createAction('gdmn/CREATE_APP', resolve => {
    return (app: Object) => resolve(app);
  }),

  deleteApp: createAction('gdmn/DELETE_APP', resolve => {
    return (uid: string) => resolve(uid);
  }),

  getApps: createAction('gdmn/GET_APPS', resolve => {
    return (apps: Array<any>) => resolve(apps);
  }),

  setApplication: createAction('gdmn/SET_APPLICATION', resolve => {
    return (application: Object) => resolve(application);
  }),

  setRunAction: createAction('gdmn/SET_RUN_ACTION', resolve => {
    return (data: {value: boolean, uid?: string}) => resolve(data);
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
  })
};

type TGdmnActions = ActionType<typeof gdmnActions>;

export { gdmnActions, TGdmnActions, gdmnActionsAsync };
