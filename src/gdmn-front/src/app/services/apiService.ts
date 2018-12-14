import { isDevMode } from '@gdmn/client-core';
import { GdmnPubSubApi } from './GdmnPubSubApi';

import config from 'config.json';

export const apiUrl = `${isDevMode() ? config.server.api.host : 'ws://' + window.location.hostname}:${
  isDevMode() ? config.server.api.port : window.location.port
}`;

export const apiService = new GdmnPubSubApi(apiUrl); // todo: config.server.authScheme