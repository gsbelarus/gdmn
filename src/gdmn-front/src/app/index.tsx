import { hot, setConfig } from 'react-hot-loader';
import React, { ReactType } from 'react';
import ReactDOM from 'react-dom';
import { Redirect, Route, Switch } from 'react-router-dom';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { isDevMode, RouteAccessLevelType } from '@gdmn/client-core';

import { getStore } from '@src/app/store/store';
import { GdmnPubSubApi } from '@src/app/services/GdmnPubSubApi';
import { ProtectedRouteContainer } from '@src/app/components/ProtectedRouteContainer';
import { getSignInBoxContainer } from '@src/app/scenes/auth/container';
import { RootContainer } from '@src/app/scenes/root/container';
import { getGdmnContainer } from '@src/app/scenes/gdmn/container';

import config from 'config.json';

const clientRootPath = config.server.paths.clientRoot;
const apiUrl = `${isDevMode() ? config.server.api.host : 'ws://' + window.location.hostname}:${
  isDevMode() ? config.server.api.port : window.location.port
}`;
const domContainerNode = config.webpack.appMountNodeId;

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
  const HotRoot = hot(module)(Root); // fixme: type ts 3.2
  const rootComponent = <HotRoot store={store} persistor={persistor} routes={rootRoutes} />;

  ReactDOM.render(rootComponent, document.getElementById(domContainerNode));
}

/* https://github.com/gaearon/react-hot-loader#-hot-labs- */
setConfig({
  // ignoreSFC: true, /* Fix Hooks */
  // pureSFC: true, // todo tmp
  // pureRender: true,  /* Remove side effect from Classes */
  logLevel: 'debug'
  // onComponentCreate: (type, name) => // todo tmp
  //   (String(type).indexOf('useState') > 0 ||
  //     String(type).indexOf('useEffect') > 0) &&
  //   cold(type)
});

(async () => {
  await start();
  render(RootContainer);
})();
