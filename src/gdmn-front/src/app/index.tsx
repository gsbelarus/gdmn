import React, { ReactType } from 'react';
import ReactDOM from 'react-dom';
import { Redirect, Route, Switch } from 'react-router-dom';

import { RouteAccessLevelType } from '@gdmn/client-core';

import { getStore } from '@src/app/store/store';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { ProtectedRouteContainer } from '@src/app/components/ProtectedRouteContainer';
import { getSignInBoxContainer } from '@src/app/scenes/auth/container';
import { RootContainer } from '@src/app/scenes/root/container';
import { getGdmnContainer } from '@src/app/scenes/gdmn/container';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import config from 'config.json';

// TODO server host/port from window
const clientRootPath = config.server.paths.clientRoot;
const apiUrl = `${config.server.http.host}:${config.server.http.port}`;
const domContainerNode = config.webpack.appMountNodeId;

// const webStorageService = new WebStorage(WebStorageType.local, { namespace: 'gdmn::' });
// const authService = new Auth(webStorageService);
const apiService = new GdmnPubSubApi(apiUrl); // todo: config.server.authScheme

const { store, persistor } = getStore(apiService);

const AuthContainer = getSignInBoxContainer(apiService);
const GdmnContainer = getGdmnContainer(apiService);
const NotFoundView = () => <h2>404!</h2>;
const rootRoutes = (
  <Switch>
    <Redirect exact={true} from={'/'} to={`${clientRootPath}/gdmn`} />
    <ProtectedRouteContainer
      path={`${clientRootPath}/gdmn/auth`}
      accessLevel={RouteAccessLevelType.PRIVATE_ANONYM}
      component={AuthContainer}
    />
    <ProtectedRouteContainer
      path={`${clientRootPath}/gdmn`}
      accessLevel={RouteAccessLevelType.PROTECTED_USER}
      component={GdmnContainer}
    />
    <Route path="*" component={NotFoundView} />
  </Switch>
);

async function start() {
  console.log('[GDMN] start');
}

initializeIcons();

function render(Root: ReactType) {
  const rootComponent = <Root store={store} persistor={persistor} routes={rootRoutes} />;

  ReactDOM.render(rootComponent, document.getElementById(domContainerNode));
}

(async () => {
  await start();
  render(RootContainer);
})();

// TODO SEARCH ANONYM
