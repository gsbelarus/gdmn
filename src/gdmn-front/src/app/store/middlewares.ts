import { Middleware } from 'redux';

import { getAuthMiddlewares } from '@src/app/scenes/auth/middlewares';
import { rootMiddlewares } from '@src/app/scenes/root/middlewares';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
// import { getGdmnMiddlewares } from '@src/app/scenes/gdmn/middlewares';
// import { getDatastoresMiddlewares } from '@src/app/scenes/datastores/middlewares';
// import { getBackupsMiddlewares } from '@src/app/scenes/backups/middlewares';
// import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';

const getMiddlewares = (apiService: GdmnPubSubApi): Middleware[] => [
  ...rootMiddlewares,
  ...getAuthMiddlewares(apiService)
  // ...getGdmnMiddlewares(apiService),
  // ...getDatastoresMiddlewares(apiService),
  // ...getBackupsMiddlewares(apiService) // todo
];

export { getMiddlewares };
