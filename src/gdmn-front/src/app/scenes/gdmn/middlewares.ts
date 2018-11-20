import { Middleware } from 'redux';
import { getType } from 'typesafe-actions';

import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { gdmnActions } from '@src/app/scenes/gdmn/actions';
import { selectAuthState } from '@src/app/store/selectors';
import { Auth } from '@gdmn/client-core';
import { authActions } from '@src/app/scenes/auth/actions';
import { rootActions } from '@src/app/scenes/root/actions';
import { Subscription } from 'rxjs';
import { TGdmnErrorCodes } from '@gdmn/server-api';

const getApiMiddleware = (apiService: GdmnPubSubApi): Middleware => {
  return ({ dispatch, getState }) => next => async (action: any) => {

    let errorSubscription: Subscription | undefined;

    switch (action.type) {
      case getType(gdmnActions.apiConnect):

        // errorSubscription =  apiService.errorMessageObservable.subscribe(
        //   value => {
        //     // if (value.meta && value.meta.code && value.meta.code === TGdmnErrorCodes.UNAUTHORIZED) { // todo tmp
        //     //
        //     // }
        //
        //     // dispatch(rootActions.onError(new Error(JSON.stringify(value))));
        //
        //
        //   }); // todo tmp test

        const accessTokenPayload = selectAuthState(getState()).accessTokenPayload;
        const refreshTokenPayload = selectAuthState(getState()).refreshTokenPayload;
        if (!!accessTokenPayload && !!refreshTokenPayload && Auth.isFreshToken(refreshTokenPayload)) {
          const token = Auth.isFreshToken(accessTokenPayload)
            ? selectAuthState(getState()).accessToken
            : selectAuthState(getState()).refreshToken;
          await apiService.auth({
            payload: {
              authorization: token || ''
            }
          });
        } else {
          dispatch(authActions.signOut());
        }
        // todo dispatch onAuthSuccess

        break;
      case getType(gdmnActions.apiDisconnect):

        if (!!errorSubscription) errorSubscription.unsubscribe();

        apiService.signOut({ payload: null });

        break;
      case getType(gdmnActions.apiPing):
        apiService.ping(action.payload).subscribe(value => {
          console.log('PING response: ' + JSON.stringify(value));
        });

        break;
      case getType(gdmnActions.apiDeleteAccount):
        // try {
          apiService.signOut({ payload: { 'delete-user': 1 } });

        // } catch(e) {
        //   console.log(e)
        // }

        break;
    }

    return next(action);
  };
};

const getGdmnMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [getApiMiddleware(apiService)];

export { getGdmnMiddlewares };
