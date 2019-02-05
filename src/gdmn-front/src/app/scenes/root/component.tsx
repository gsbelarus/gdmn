import '@src/styles/global.css';

import React, { FC, Fragment, ReactNode, ReactType } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
// @ts-ignore
import { PersistGate } from 'redux-persist/integration/react';
// @ts-ignore
import { Persistor } from 'redux-persist/lib/types';
import {
  Customizer,
  Fabric,
  ScrollablePane,
  ScrollbarVisibility,
  Sticky,
  StickyPositionType
} from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { ErrorBoundary, isDevMode } from '@gdmn/client-core';

// TODO const history = browserHistory; // syncHistoryWithStore(browserHistory, store)

const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

interface IRootProps {
  readonly store: Store;
  readonly persistor: Persistor;
  readonly routes: ReactNode;
  readonly renderErrorMsgBarContainer: ReactType;
  readonly renderStompLogPanelContainer: ReactType;
  readonly renderLostConnectWarnMsgContainer: ReactType;
  readonly renderConnectBtnContainer: ReactType;
}

const Root: FC<IRootProps> = ({
  store,
  persistor,
  routes,
  renderLostConnectWarnMsgContainer: LostConnectWarnMsgContainer,
  renderErrorMsgBarContainer: ErrorMsgBarContainer,
  renderStompLogPanelContainer: StompLogPanelContainer,
  renderConnectBtnContainer: ConnectBtnContainer
}) => (
  <ErrBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Fragment>
          <Fabric style={{ height: '100%' }}>
            <Customizer {...FluentCustomizations}>
              <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                <BrowserRouter>{routes}</BrowserRouter>
                <Sticky stickyPosition={StickyPositionType.Footer}>
                  <ErrorMsgBarContainer />
                  <LostConnectWarnMsgContainer />
                  <footer style={{ backgroundColor: 'lightgray', padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      <StompLogPanelContainer />
                      <ConnectBtnContainer />
                    </div>
                  </footer>
                </Sticky>
              </ScrollablePane>
            </Customizer>
          </Fabric>
        </Fragment>
      </PersistGate>
    </Provider>
  </ErrBoundary>
);

export { Root, IRootProps };
