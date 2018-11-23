import {Auth} from "@gdmn/client-core";
import {TGdmnErrorCodes, TTaskActionNames} from "@gdmn/server-api";
import {authActions} from "@src/app/scenes/auth/actions";
import {gdmnActions} from "@src/app/scenes/gdmn/actions";
import {rootActions} from "@src/app/scenes/root/actions";

import {GdmnPubSubApi} from "@src/app/services/GdmnPubSubApi";
import {selectAuthState} from "@src/app/store/selectors";
import {deserializeERModel} from "gdmn-orm";
import {Middleware} from "redux";
import {Subscription} from "rxjs";
import {first} from "rxjs/operators";
import {getType} from "typesafe-actions";

const getApiMiddleware = (apiService: GdmnPubSubApi): Middleware => {
  return ({ dispatch, getState }) => next => async (action: any) => {
    let errorSubscription: Subscription | undefined;

    switch (action.type) {
      case getType(gdmnActions.apiConnect):
        // todo: sub first()

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

          } catch (errMessage) {
            console.log('auth: ', errMessage);

            if (errorSubscription) {
              errorSubscription.unsubscribe();
              errorSubscription = undefined;
            } // todo

            // IPubSubMessage<TGdmnReceivedErrorMeta>
            if (errMessage.meta && errMessage.meta.code && errMessage.meta.code === TGdmnErrorCodes.UNAUTHORIZED) {
              dispatch(authActions.signOut());
            } else {
              dispatch(rootActions.onError(new Error(errMessage.meta ? errMessage.meta.message : errMessage)));
            }
          }
        } else {
          dispatch(authActions.signOut());
        }

        errorSubscription = apiService.errorMessageObservable.pipe(first()).subscribe(errMessage => {
          //  IPubSubMessage<TGdmnReceivedErrorMeta>
          if (errMessage.meta && !!errMessage.meta.code && errMessage.meta!.code === TGdmnErrorCodes.UNAUTHORIZED) {
            dispatch(authActions.signOut());
          } else {

            //  fixme: duplication after auth error
            dispatch(
              rootActions.onError(
                new Error(
                  errMessage.meta && errMessage.meta!.message ? errMessage.meta!.message : JSON.stringify(errMessage)
                )
              )
            );

            if (errMessage.meta && !!errMessage.meta.code && errMessage.meta!.code === TGdmnErrorCodes.INTERNAL) {
              dispatch(gdmnActions.apiConnect(true));
            }

            // dispatch(rootActions.onError(new Error('ОБНОВИТЕ СТРАНИЦУ!')));
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
          } catch (errMessage) {
            if (errMessage.meta && errMessage.meta.code && errMessage.meta.code === TGdmnErrorCodes.UNAUTHORIZED) {
              dispatch(authActions.signOut());
            } else {
              dispatch(rootActions.onError(new Error(errMessage.meta ? errMessage.meta.message : errMessage)));
            }
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
