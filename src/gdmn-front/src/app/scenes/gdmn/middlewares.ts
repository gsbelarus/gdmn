import { deserializeERModel } from 'gdmn-orm';
import { Middleware } from 'redux';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { getType } from 'typesafe-actions';
import { Auth, TPubSubConnectStatus } from '@gdmn/client-core';
import { TGdmnErrorCodes, TTaskActionNames, TTaskStatus } from '@gdmn/server-api';

import { authActions } from '@src/app/scenes/auth/actions';
import { gdmnActions, TGdmnActions } from '@src/app/scenes/gdmn/actions';
import { rootActions } from '@src/app/scenes/root/actions';
import { GdmnPubSubApi, GdmnPubSubError } from '@src/app/services/GdmnPubSubApi';
import { selectAuthState } from '@src/app/store/selectors';

const getApiMiddleware = (apiService: GdmnPubSubApi): Middleware => {
  return ({ dispatch, getState }) => next => async (action: TGdmnActions) => {
    let errorSubscription: Subscription | undefined;
    let taskProgressResultSub: Subscription | undefined;
    let taskStatusResultSub: Subscription | undefined;
    let taskActionResultSub: Subscription | undefined;
    let connectionStatusSub: Subscription | undefined;

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
              if (!message.data) throw Error('Invalid server response');

              dispatch(gdmnActions.setLoading(true, JSON.parse(message.data).progress.description || ''));
            });
            taskStatusResultSub = apiService.taskStatusResultObservable!.subscribe(message => {
              if (!message.data) throw Error('Invalid server response');

              const status: TTaskStatus = JSON.parse(message.data).status;

              if (status == TTaskStatus.RUNNING) {
                dispatch(gdmnActions.setLoading(true, 'Task running...'));
              } else {
                dispatch(gdmnActions.setLoading(false));
              }
            });
            taskActionResultSub = apiService.taskActionResultObservable!.subscribe(message => {
              if (!message.data) throw Error('Invalid server response');

              if (JSON.parse(message.data).error) {
                dispatch(rootActions.onError(new Error(JSON.parse(message.data).error)));
              }
            });
            connectionStatusSub = apiService.pubSubClient.connectionStatusObservable.subscribe(value => {
              if (value == TPubSubConnectStatus.CONNECTING) { // todo: test
                dispatch(gdmnActions.setLoading(true, 'Connecting...'));
              } else {
                dispatch(gdmnActions.setLoading(false));
              }
            });
            ////

            dispatch(gdmnActions.apiGetSchema());

            dispatch(gdmnActions.buildCommandList());
          } catch (error) {
            console.log('auth error: ', error);

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
              dispatch(authActions.signOut());
            } else {
              dispatch(rootActions.onError(error));
            }
            // } else {
            //   dispatch(rootActions.onError(new Error(error)));
            // }
          }
        } else {
          dispatch(authActions.signOut());
        }

        errorSubscription = apiService.errorMessageObservable.pipe(first()).subscribe(errMessage => {
          const error = new GdmnPubSubError(errMessage);

          if (error.errorData.code === TGdmnErrorCodes.UNAUTHORIZED) {
            dispatch(authActions.signOut());
          } else {
            dispatch(rootActions.onError(error));

            if (error.errorData.code === TGdmnErrorCodes.INTERNAL) {
              dispatch(gdmnActions.apiConnect(true));
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

      case getType(gdmnActions.apiPing): {
        apiService.ping(action.payload);

        break;
      }

      case getType(gdmnActions.apiGetSchema): {
        apiService
          .getSchema({
            payload: {
              action: TTaskActionNames.GET_SCHEMA,
              payload: undefined
            }
          })
          .subscribe(value => {
            if (!!value.payload.result) {
              const erModel = deserializeERModel(value.payload.result);
              dispatch(gdmnActions.setSchema(erModel));
            }
          });

        break;
      }

      case getType(gdmnActions.apiGetData): {
        apiService.getData({
          payload: {
            action: TTaskActionNames.QUERY,
            payload: action.payload
          }
        });
        // todo sub

        break;
      }

      case getType(gdmnActions.buildCommandList): {
        break;
      }

      case getType(gdmnActions.apiDeleteAccount): {
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
              dispatch(authActions.signOut());
            } else {
              dispatch(rootActions.onError(error));
            }
            // } else {
            //   dispatch(rootActions.onError(new Error(error)));
            // }
          }
        } else {
          dispatch(authActions.signOut());
        }

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
    dispatch(gdmnActions.setLoading(false));
  } else {
    // todo tmp
    if (action.type.slice(action.type.length, -'_REQUEST'.length) === '_REQUEST') {
      dispatch(gdmnActions.setLoading(true));
    } else if (
      action.type.slice(action.type.length, -'_OK'.length) === '_OK' ||
      action.type.slice(action.type.length, -'_ERROR'.length) === '_ERROR'
    ) {
      dispatch(gdmnActions.setLoading(false));
    }
  }

  return next(action);
};

const getGdmnMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [
  getApiMiddleware(apiService),
  loadingMiddleware
];

export { getGdmnMiddlewares };
