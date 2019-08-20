import { hot, setConfig } from 'react-hot-loader';
import React, { ReactType } from 'react';
import ReactDOM from 'react-dom';
import { Redirect, Route, Switch } from 'react-router-dom';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { RouteAccessLevelType } from '@gdmn/client-core';
import config from 'config.json';
import { getStore } from '@src/app/store/store';
import { ProtectedRouteContainer } from '@src/app/components/ProtectedRouteContainer';
import { SignInBoxContainer } from '@src/app/scenes/auth/container';
import { GdmnContainer } from '@src/app/scenes/gdmn/container';
import { rootActions } from '@src/app/scenes/root/actions';
import { apiService } from './services/apiService';
import { Root } from './scenes/root/component';

const clientRootPath = config.server.paths.clientRoot;
const domContainerNode = config.webpack.appMountNodeId;

export const { store, persistor } = getStore(apiService);

// apiService.pubSubClient.debug = message => store.dispatch(rootActions.addStompLogMessage(message));
apiService.pubSubClient.debug = message => 0;
apiService.pubSubClient.onMaxCountAbnormallyReconnect = (maxAbnormallyReconnectCount, context) => {
  store.dispatch(rootActions.setLostConnectWarnOpened(true));
};

const NotFoundView = () => <h2>404!</h2>;
const rootRoutes = (
  <Switch>
    <Redirect exact={true} from={'/'} to={`${clientRootPath}/gdmn`} />
    <ProtectedRouteContainer
      path={`${clientRootPath}/gdmn/auth`}
      accessLevel={RouteAccessLevelType.PRIVATE_ANONYM}
      component={SignInBoxContainer}
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
  //-//console.log('[GDMN] start');
}

initializeIcons();

function render(Root: ReactType) {
  const HotRoot = hot(module)(Root);
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
  render(Root);
})();
