import { Middleware } from 'redux';

import { authMiddlewares } from '@src/app/scenes/auth/middlewares';
import { rootMiddlewares } from '@src/app/scenes/root/middlewares';
// import { getGdmnMiddlewares } from '@src/app/scenes/gdmn/middlewares';
// import { getDatastoresMiddlewares } from '@src/app/scenes/datastores/middlewares';
// import { getBackupsMiddlewares } from '@src/app/scenes/backups/middlewares';
// import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';

const getMiddlewares = (): // apiService: GdmnPubSubApi
Middleware[] => [
  ...rootMiddlewares,
  ...authMiddlewares
  // ...getGdmnMiddlewares(apiService),
  // ...getDatastoresMiddlewares(apiService),
  // ...getBackupsMiddlewares(apiService) // todo
];

export { getMiddlewares };
