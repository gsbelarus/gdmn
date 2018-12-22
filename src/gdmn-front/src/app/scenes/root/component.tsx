import '@src/styles/global.css';

import React, { Fragment, ReactNode, ReactType, SFC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Persistor } from 'redux-persist/lib/types';
import { ErrorBoundary, isDevMode } from '@gdmn/client-core';

export interface IRootProps {
  readonly store: Store;
  readonly persistor: Persistor;
  readonly routes: ReactNode;
  readonly renderMessageBarContainer: ReactType;
}

// TODO const history = browserHistory; // syncHistoryWithStore(browserHistory, store)

const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

export const Root: SFC<IRootProps> = ({ store, persistor, routes, renderMessageBarContainer: MessageBarContainer }) => (
  <ErrBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Fragment>
          <BrowserRouter>{routes}</BrowserRouter>
          <MessageBarContainer />
        </Fragment>
      </PersistGate>
    </Provider>
  </ErrBoundary>
);
