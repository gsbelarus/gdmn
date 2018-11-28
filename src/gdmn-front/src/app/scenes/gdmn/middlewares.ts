import { Auth } from '@gdmn/client-core';
import { TGdmnErrorCodes, TTaskActionNames } from '@gdmn/server-api';
import { authActions } from '@src/app/scenes/auth/actions';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { rootActions } from '@src/app/scenes/root/actions';

import { GdmnPubSubApi, GdmnPubSubError } from '@src/app/services/GdmnPubSubApi';
import { selectAuthState } from '@src/app/store/selectors';
import { deserializeERModel } from 'gdmn-orm';
import { Middleware } from 'redux';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { getType } from 'typesafe-actions';

const getApiMiddleware = (apiService: GdmnPubSubApi): Middleware => {
  return ({ dispatch, getState }) => next => async (action: any) => {
    let errorSubscription: Subscription | undefined;

    switch (action.type) {
      case getType(gdmnActions.apiConnect):
        const accessTokenPayload = selectAuthState(getState()).accessTokenPayload;
        const refreshTokenPayload = selectAuthState(getState()).refreshTokenPayload;
        if (!!accessTokenPayload && !!refreshTokenPayload && Auth.isFreshToken(refreshTokenPayload)) {
          const token = Auth.isFreshToken(accessTokenPayload)
            ? selectAuthState(getState()).accessToken
            : selectAuthState(getState()).refreshToken;

          try {
            await apiService.auth({
              payload: {
                authorization: token || ''
              }
            });

            dispatch(gdmnActions.apiGetSchema());
          } catch (error) {
            console.log('auth error: ', error);

            if (errorSubscription) {
              errorSubscription.unsubscribe();
              errorSubscription = undefined;
            } // todo

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
          const error = new GdmnPubSubError(<any>errMessage); // fixme type

          if (error.errorData.code === TGdmnErrorCodes.UNAUTHORIZED) {
            dispatch(authActions.signOut());
          } else {
            //  fixme: duplication after auth error
            dispatch(rootActions.onError(error));

            if (error.errorData.code === TGdmnErrorCodes.INTERNAL) {
              dispatch(gdmnActions.apiConnect(true));
            } else {
              // dispatch(rootActions.onError(new Error('ОБНОВИТЕ СТРАНИЦУ!')));
            }
          }
        });

        break;
      case getType(gdmnActions.apiDisconnect):
        if (!!errorSubscription) {
          errorSubscription.unsubscribe();
          errorSubscription = undefined;
        }

        apiService.signOut({ payload: null });

        break;
      case getType(gdmnActions.apiPing):
        apiService.ping(action.payload).subscribe(value => {
          console.log('PING response: ' + JSON.stringify(value));
        });

        break;
      case getType(gdmnActions.apiGetSchema):
        apiService.getSchema({
          payload: {
            action: TTaskActionNames.GET_SCHEMA,
            payload: undefined
          }
        }).subscribe(value => {
            if (value.error) {
              dispatch(rootActions.onError(new Error(value.error.message)));
            } else if (!!value.payload.result) {
              const erModel = deserializeERModel(value.payload.result);
              dispatch(gdmnActions.setSchema(erModel));
            }
          });

        break;
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

const getGdmnMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [getApiMiddleware(apiService)];

export { getGdmnMiddlewares };
