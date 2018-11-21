import { Middleware } from 'redux';

import { authMiddlewares } from '@src/app/scenes/auth/middlewares';
import { rootMiddlewares } from '@src/app/scenes/root/middlewares';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { getGdmnMiddlewares } from '@src/app/scenes/gdmn/middlewares';

const getMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [
  ...rootMiddlewares,
  ...authMiddlewares,
  ...getGdmnMiddlewares(apiService)
];

export { getMiddlewares };
