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
import { RootContainer } from '@src/app/scenes/root/container';
import { GdmnContainer } from '@src/app/scenes/gdmn/container';
import { rootActions } from '@src/app/scenes/root/actions';
import { apiService } from './services/apiService';


const clientRootPath = config.server.paths.clientRoot;
const domContainerNode = config.webpack.appMountNodeId;

const { store, persistor } = getStore(apiService);

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


// (async () => {
//
//   const initStressStepDuration: number = 2;
//   const initStressStepInitRequestsCount: number = 10;
//   const initStressStepIncRequestsCount: number = 10;
//
//   const handleStressApi = async () => {
//     await stressLoop((resolve: any) => {
//       // //-//console.log('[test] stressLoop')
//       apiService
//         .ping({
//           payload: {
//             action: TTaskActionNames.PING,
//             payload: {
//               delay: 0,
//               steps: 0
//             }
//           }
//         })
//         .pipe(
//           filter(value => Reflect.has(value.payload, 'result') && value.payload.status === TTaskStatus.DONE),
//           first(),
//           // observeOn(async)
//         )
//         .subscribe(value => {
//
//           //-//console.log('[test] result', value);
//
//           resolve();
//         });
//     });
//   };
//
//   const stressLoop = async (cb: Function) => {
//     let maxRequestsCount: number = initStressStepInitRequestsCount;
//     const incRequestsCount: number =  initStressStepIncRequestsCount;
//     const stepDuration: number = initStressStepDuration;
//
//
//     let timeStart;
//
//     do {
//       // //-//console.log('[test] do');
//       timeStart = window.performance.now();
//
//       const parr = [];
//       for (let i = 0; i < maxRequestsCount; i++) {
//         parr.push(new Promise((resolve, reject) => {
//           // //-//console.log('[test] Promise');
//           cb(resolve);
//         }));
//       }
//
//       await Promise.all(parr);
//
//       maxRequestsCount += incRequestsCount;
//
//     } while (window.performance.now() - timeStart < stepDuration);
//
//     //-//console.log('[test] maxRequestsCount: ', maxRequestsCount - incRequestsCount);
//     //-//console.log('[test] time: ', window.performance.now() - timeStart);
//   };
//
//   await handleStressApi();
//
// })();



(async () => {
  await start();
  render(RootContainer);
})();
