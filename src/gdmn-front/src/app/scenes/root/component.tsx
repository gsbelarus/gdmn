import '@src/styles/global.css';

import React, { ReactNode, ReactType, SFC, Fragment } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { PersistGate } from 'redux-persist/integration/react';
import { Persistor } from 'redux-persist/es/types';
import { ErrorBoundary, isDevMode } from '@gdmn/client-core';

interface IRootProps {
  readonly theme: Theme;
  readonly store: Store;
  readonly persistor: Persistor;
  readonly routes: ReactNode;
  readonly renderSnackbarContainer: ReactType;
}

// TODO const history = browserHistory; // syncHistoryWithStore(browserHistory, store)

const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

const Root: SFC<IRootProps> = ({ store, persistor, routes, theme, renderSnackbarContainer: SnackbarContainer }) => (
  <ErrBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Fragment>
          <BrowserRouter>
            <MuiThemeProvider theme={theme}>
              <CssBaseline />
              {routes}
            </MuiThemeProvider>
          </BrowserRouter>
          <SnackbarContainer />
        </Fragment>
      </PersistGate>
    </Provider>
  </ErrBoundary>
);

export { Root, IRootProps };
