import { Middleware } from 'redux';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { getType, ActionType } from 'typesafe-actions';
import { Auth, TPubSubConnectStatus } from '@gdmn/client-core';
import { TGdmnErrorCodes, TTaskStatus } from '@gdmn/server-api';
import { authActionsAsync } from '@src/app/scenes/auth/actions';
import { gdmnActions, gdmnActionsAsync, GdmnAction } from '@src/app/scenes/gdmn/actions';
import { rootActions, TRootActions } from '@src/app/scenes/root/actions';
import { GdmnPubSubApi, GdmnPubSubError } from '@src/app/services/GdmnPubSubApi';
import { selectAuthState } from '@src/app/store/selectors';
import { TThunkMiddleware } from '@src/app/store/middlewares';
import { loadRSActions } from '@src/app/store/loadRSActions';
import { themes } from '../themeeditor/themes';
import { loadTheme } from '@uifabric/styling';
import { calcGridColors } from '@src/app/utils/calcGridColors';

const MAX_INTERNAL_ERROR_RECONNECT_COUNT: number = 5;

const getApiMiddleware = (apiService: GdmnPubSubApi): TThunkMiddleware => {
  return ({ dispatch, getState }) => next => async (action: GdmnAction) => {
    let errorSubscription: Subscription | undefined;
    let taskProgressResultSub: Subscription | undefined;
    let taskStatusResultSub: Subscription | undefined;
    let taskActionResultSub: Subscription | undefined;
    let connectionStatusSub: Subscription | undefined;

    let internalErrorCounter: number = 0;

    switch (action.type) {
      case getType(gdmnActions.apiConnect): {
        const authState = selectAuthState(getState());
        const { accessTokenPayload, refreshTokenPayload, accessToken, refreshToken } = authState;

        if (accessTokenPayload && refreshTokenPayload && Auth.isFreshToken(refreshTokenPayload)) {
          const token = Auth.isFreshToken(accessTokenPayload) ? accessToken : refreshToken;

          try {
            await apiService.auth({
              payload: {
                'app-uid': authState.application ? authState.application.uid : '',
                authorization: token || ''
              }
            });

            //// PROGRESS
            taskProgressResultSub = apiService.taskProgressResultObservable!.subscribe(message => {
              if (!message.data) throw Error('[GDMN] Invalid server response');

              // dispatch(gdmnActions.setLoading(true, JSON.parse(message.data).progress.description || ''));
            });
            taskStatusResultSub = apiService.taskStatusResultObservable!.subscribe(message => {
              if (!message.data) throw Error('[GDMN] Invalid server response');

              const status: TTaskStatus = JSON.parse(message.data).status;

              if (status == TTaskStatus.RUNNING) {
                // dispatch(gdmnActions.setLoading(true, 'Task running...'));
              } else {
                // dispatch(gdmnActions.setLoading(false));
              }
            });
            taskActionResultSub = apiService.taskActionResultObservable!.subscribe(message => {
              if (!message.data) throw Error('[GDMN] Invalid server response');

              if (JSON.parse(message.data).error) {
                console.log('[GDMN] task result error:', JSON.parse(message.data).error);

                dispatch(rootActions.onError(new Error(JSON.parse(message.data).error.message)));
              }
            });
            connectionStatusSub = apiService.pubSubClient.connectionStatusObservable.subscribe(value => {
              if (value == TPubSubConnectStatus.CONNECTING) {
                // todo: test
                // dispatch(gdmnActions.setLoading(true, 'Connecting...'));
              } else {
                // dispatch(gdmnActions.setLoading(false));

                // todo
                if (value == TPubSubConnectStatus.DISCONNECTING || value == TPubSubConnectStatus.DISCONNECTED) {
                  if (errorSubscription) {
                    errorSubscription.unsubscribe();
                    errorSubscription = undefined;
                  }
                  if (taskProgressResultSub) {
                    taskProgressResultSub.unsubscribe();
                    taskProgressResultSub = undefined;
                  }
                  if (taskStatusResultSub) {
                    taskStatusResultSub.unsubscribe();
                    taskStatusResultSub = undefined;
                  }
                  if (taskActionResultSub) {
                    taskActionResultSub.unsubscribe();
                    taskActionResultSub = undefined;
                  }
                  if (connectionStatusSub) {
                    connectionStatusSub.unsubscribe();
                    connectionStatusSub = undefined;
                  }
                }
              }
            });
            ////

            dispatch(gdmnActionsAsync.apiGetSchema());

            if(!authState.application) {
              dispatch(gdmnActionsAsync.apiGetApps());
            }

            dispatch(gdmnActions.buildCommandList());
          } catch (error) {
            //-//console.log('[GDMN] auth error: ', error);

            if (errorSubscription) {
              errorSubscription.unsubscribe();
              errorSubscription = undefined;
            } // todo
            if (taskProgressResultSub) {
              taskProgressResultSub.unsubscribe();
              taskProgressResultSub = undefined;
            }
            if (taskStatusResultSub) {
              taskStatusResultSub.unsubscribe();
              taskStatusResultSub = undefined;
            }
            if (taskActionResultSub) {
              taskActionResultSub.unsubscribe();
              taskActionResultSub = undefined;
            }
            if (connectionStatusSub) {
              connectionStatusSub.unsubscribe();
              connectionStatusSub = undefined;
            }

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

        errorSubscription = apiService.errorMessageObservable.pipe(first()).subscribe(errMessage => {
          const error = new GdmnPubSubError(errMessage);

          if (error.errorData.code === TGdmnErrorCodes.UNAUTHORIZED) {
            dispatch(authActionsAsync.signOut());
          } else {
            dispatch(rootActions.onError(error));

            if (error.errorData.code === TGdmnErrorCodes.INTERNAL) {
              if (internalErrorCounter <= MAX_INTERNAL_ERROR_RECONNECT_COUNT) {
                internalErrorCounter++;
                dispatch(gdmnActions.apiConnect(true));
              } else {
                // TODO dialog
                rootActions.onError(
                  new Error('[GDMN] Исчерпано максимальное кол-во попыток соединения с сервером. Попробуйте позже.')
                );
              }
            } else {
              // dispatch(rootActions.onError(new Error('ОБНОВИТЕ СТРАНИЦУ!')));
            }
          }
        });

        break;
      }

      case getType(gdmnActions.apiDisconnect): {
        if (errorSubscription) {
          errorSubscription.unsubscribe();
          errorSubscription = undefined;
        }
        if (taskProgressResultSub) {
          taskProgressResultSub.unsubscribe();
          taskProgressResultSub = undefined;
        }
        if (taskStatusResultSub) {
          taskStatusResultSub.unsubscribe();
          taskStatusResultSub = undefined;
        }
        if (taskActionResultSub) {
          taskActionResultSub.unsubscribe();
          taskActionResultSub = undefined;
        }
        if (connectionStatusSub) {
          connectionStatusSub.unsubscribe();
          connectionStatusSub = undefined;
        }

        await apiService.signOut({ payload: null });
        break;
      }
    }

    return next(action);
  };
};

const loadingMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  if (
    action.payload &&
    /* support not fsa-compliant redux actions (without action.error) see: piotrwitek/typesafe-actions#52 */
    (action.error || action.payload instanceof Error)
  ) {
    // dispatch(gdmnActions.setLoading(false));
  } else {
    // todo tmp
    if (action.type.slice(action.type.length, -'_REQUEST'.length) === '_REQUEST') {
      // dispatch(gdmnActions.setLoading(true));
    } else if (
      action.type.slice(action.type.length, -'_OK'.length) === '_OK' ||
      action.type.slice(action.type.length, -'_ERROR'.length) === '_ERROR'
    ) {
      // dispatch(gdmnActions.setLoading(false));
    }
  }

  return next(action);
};

const abortNetReconnectMiddleware: TThunkMiddleware = ({ dispatch, getState }) => next => async (
  action: TRootActions
) => {
  switch (action.type) {
    case getType(rootActions.abortNetReconnect): {
      dispatch(gdmnActionsAsync.apiDeactivate());
      break;
    }
    case getType(rootActions.netReconnect): {
      dispatch(gdmnActionsAsync.apiActivate());
      break;
    }
  }

  return next(action);
};

const viewTabMiddleware: TThunkMiddleware = ({ dispatch, getState }) => next => (action: ActionType<typeof gdmnActions.deleteViewTab>) => {
  if (action.type === getType(gdmnActions.deleteViewTab)) {
    const { viewTabURL, locationPath, historyPush } = action.payload;
    const viewTabs = getState().gdmnState.viewTabs;

    const foundIdx = viewTabs.findIndex(t => t.url === viewTabURL);

    if (foundIdx > -1) {
      if (locationPath && historyPush) {
      let nextPath = "";

      if (locationPath === viewTabURL) {
        if (viewTabs.length === 1) {
          nextPath = "/spa/gdmn";
        } else {
          nextPath = foundIdx > 0 ? viewTabs[foundIdx - 1].url : viewTabs[foundIdx + 1].url;
        }
      }

      if (nextPath) {
        historyPush(nextPath);
      }
      }

      const viewTab = viewTabs[foundIdx];

      if (viewTab.rs) {
        viewTab.rs
          .filter( name => !viewTabs.find( t => t !== viewTab && !!t.rs && !!t.rs.find( n => n === name ) ) )
          .forEach( name => dispatch(loadRSActions.deleteRS({ name })) );
      }
    }
  }

  return next(action);
};

const selectThemeMiddleware: TThunkMiddleware = () => next => (action: ActionType<typeof gdmnActions.selectTheme>) => {
  if (action.type === getType(gdmnActions.selectTheme)) {
    const namedTheme = themes.find( t => t.name === action.payload );

    if (!namedTheme) {
      throw new Error(`Invalid theme name ${action.payload}`);
    }

    loadTheme(namedTheme.theme);

    return next(gdmnActions.setThemeAndGridColors(action.payload, calcGridColors()));
  }

  return next(action);
};

const nlpDialogMiddleware: TThunkMiddleware = ({ getState, dispatch }) => next => (action: ActionType<typeof gdmnActions.addNLPItem>) => {
  if (action.type === getType(gdmnActions.addNLPItem)) {
    const { item, history } = action.payload;

    switch (item.text) {
      case 'close': {
        const { viewTabs } = getState().gdmnState;

        const tab = viewTabs.find( t => t.url === history.location.pathname );

        if (tab && tab.canClose) {
          dispatch(gdmnActions.deleteViewTab({
            viewTabURL: history.location.pathname,
            locationPath: history.location.pathname,
            historyPush: history.push
          }));
          next(action);
          return next(gdmnActions.addNLPItem({ item: { who: 'it', text: `Вкладка ${tab.caption} закрыта` }, history }));
        }

        return next(action);
      }
    }

    const { erModel } = getState().gdmnState;
    const entity = erModel.entities[item.text];

    if (entity) {
      history.push(`/spa/gdmn/entity/${entity.name}`);
      next(action);
      return next(gdmnActions.addNLPItem({ item: { who: 'it', text: 'found!' }, history }));
    }
  }

  return next(action);
};

export const getGdmnMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [
  abortNetReconnectMiddleware,
  getApiMiddleware(apiService),
  loadingMiddleware,
  viewTabMiddleware,
  selectThemeMiddleware,
  nlpDialogMiddleware
];
