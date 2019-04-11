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
    const response = await apiService.getSchema({withAdapter: true});
    if (response.payload.status === TTaskStatus.SUCCESS) {
      const erModel = deserializeERModel(response.payload.result!, true);
      dispatch(gdmnActions.setSchema(erModel));
    }
  },
  apiCreateApp: (payload: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP]): TThunkAction => async (dispatch, getState, { apiService }) => {
    const fakeUid = `fakeUID:${new Date()}`; // TODO
    dispatch(gdmnActions.createApp({
      ...payload.connectionOptions && payload.connectionOptions,
      id: -1,
      uid: fakeUid,
      alias: payload.alias,
      ownerKey: -1,
      external: payload.external,
      creationDate: new Date(),
      loading: true
    }));
    const response = await apiService.createApp(payload);
    switch (response.payload.status) {
      case TTaskStatus.SUCCESS: {
        dispatch(gdmnActions.updateApp(fakeUid, {...response.payload.result!, loading: false}));
        break;
      }
      case TTaskStatus.PAUSED: {
        dispatch(gdmnActions.deleteApp(fakeUid));
        throw new Error("Unsupported response status");
      }
      case TTaskStatus.FAILED:
      case TTaskStatus.INTERRUPTED: {
        dispatch(gdmnActions.deleteApp(fakeUid));
        break;
      }
    }
  },
  apiDeleteApp: (uid: string): TThunkAction => async (dispatch, getState, { apiService }) => {
    const deletedApp = getState().gdmnState.apps.find((item) => item.uid === uid);
    if (!deletedApp) {
      throw new Error("App is not found");
    }
    dispatch(gdmnActions.updateApp(deletedApp.uid, {...deletedApp, loading: true}));
    const response = await apiService.deleteApp({uid});
    switch(response.payload.status) {
      case TTaskStatus.SUCCESS: {
        dispatch(gdmnActions.deleteApp(uid));
        break;
      }
      case TTaskStatus.PAUSED: {
        dispatch(gdmnActions.updateApp(deletedApp.uid, {...deletedApp, loading: false}));
        throw new Error("Unsupported response status");
      }
      case TTaskStatus.FAILED:
      case TTaskStatus.INTERRUPTED: {
        dispatch(gdmnActions.updateApp(deletedApp.uid, {...deletedApp, loading: false}));
        break;
      }
    }
  },
  apiGetApps: (): TThunkAction => async (dispatch, getState, { apiService }) => {
    const response = await apiService.getApps();
    if (response.payload.status === TTaskStatus.SUCCESS) {
      dispatch(gdmnActions.setApps(response.payload.result!));
    }
  },
  reconnectToApp: (app?: IApplicationInfo): TThunkAction => async (dispatch, getState, { apiService }) => {
    const {application, ...authState} = selectAuthState(getState());
    dispatch(gdmnActions.apiDisconnect());
    dispatch(authActions.onSignOut());

    dispatch(authActions.signIn.request());
    dispatch(authActions.setApplication(app));
    dispatch(authActions.signIn.success({...authState}));

    dispatch(gdmnActions.apiConnect());
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
    return (application: IApplicationInfo & {loading?: boolean}) => resolve(application);
  }),

  updateApp: createAction('gdmn/UPDATE_APP', resolve => {
    return (uid: string, application: IApplicationInfo & {loading?: boolean}) => resolve({uid, application});
  }),

  deleteApp: createAction('gdmn/DELETE_APP', resolve => {
    return (uid: string) => resolve(uid);
  }),

  setApps: createAction('gdmn/SET_APPS', resolve => {
    return (apps: Array<IApplicationInfo & {loading?: boolean}>) => resolve(apps);
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
