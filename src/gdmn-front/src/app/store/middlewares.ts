import { AnyAction, Middleware } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import { rootMiddlewares } from '@src/app/scenes/root/middlewares';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { getGdmnMiddlewares } from '@src/app/scenes/gdmn/middlewares';
import { IState } from '@src/app/store/reducer';
import { loadRsMiddleware } from './loadRSMiddleware';

export const getMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [
  thunk.withExtraArgument({ apiService }),
  ...rootMiddlewares,
  ...getGdmnMiddlewares(apiService),
  loadRsMiddleware(apiService)
];

export type TThunkMiddleware = ThunkMiddleware<IState, AnyAction, { apiService: GdmnPubSubApi }>;