import { isDevMode } from '@gdmn/client-core';

import { configureStore as configureStoreDev } from '@src/app/store/configureStore/configureStore-develop';
import { configureStore as configureStoreProd } from '@src/app/store/configureStore/configureStore-production';

// todo: test require
const configureStore = isDevMode() ? configureStoreDev : configureStoreProd;

export { configureStore };
