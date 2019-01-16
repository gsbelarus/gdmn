import { Middleware } from 'redux';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { getType } from 'typesafe-actions';
import { Auth, TPubSubConnectStatus } from '@gdmn/client-core';
import { TGdmnErrorCodes, TTaskStatus } from '@gdmn/server-api';

import { authActionsAsync } from '@src/app/scenes/auth/actions';
import { gdmnActions, gdmnActionsAsync, TGdmnActions } from '@src/app/scenes/gdmn/actions';
import { rootActions, TRootActions } from '@src/app/scenes/root/actions';
import { GdmnPubSubApi, GdmnPubSubError } from '@src/app/services/GdmnPubSubApi';
import { selectAuthState } from '@src/app/store/selectors';
import { TThunkMiddleware } from '@src/app/store/middlewares';

const MAX_INTERNAL_ERROR_RECONNECT_COUNT: number = 5;

const getApiMiddleware = (apiService: GdmnPubSubApi): TThunkMiddleware => {
  return ({ dispatch, getState }) => next => async (action: TGdmnActions) => {
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
                dispatch(rootActions.onError(new Error(JSON.stringify(JSON.parse(message.data).error))));
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

        apiService.signOut({ payload: null });

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

const getGdmnMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [
  abortNetReconnectMiddleware,
  getApiMiddleware(apiService),
  loadingMiddleware
];

export { getGdmnMiddlewares };
