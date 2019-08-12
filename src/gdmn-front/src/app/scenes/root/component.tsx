import '@src/styles/global.css';
import React, { FC, Fragment, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
// @ts-ignore
import { PersistGate } from 'redux-persist/integration/react';
// @ts-ignore
import { Persistor } from 'redux-persist/lib/types';
import { ErrorBoundary, isDevMode } from '@gdmn/client-core';

// TODO const history = browserHistory; // syncHistoryWithStore(browserHistory, store)

const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

export interface IRootProps {
  readonly store: Store;
  readonly persistor: Persistor;
  readonly routes: ReactNode;
};

export const Root: FC<IRootProps> = ({ store, persistor, routes, }) => (
  <ErrBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>{routes}</BrowserRouter>
      </PersistGate>
    </Provider>
  </ErrBoundary>
);

