import React, { Component, Fragment, PureComponent, RefObject, SFC } from 'react';
import { NavLink, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import {
  AppBar,
  Button,
  Collapse,
  Divider,
  Drawer,
  Icon,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@material-ui/core';
import CSSModules, { InjectedCSSModuleProps } from 'react-css-modules';
import { BreadcrumbsProps, InjectedProps } from 'react-router-breadcrumbs-hoc';

import styles from './styles.css';
// import { TDataStoresState } from '@src/app/scenes/datastores/reducer';
import { isDevMode, ErrorBoundary } from '@gdmn/client-core';
// import { StompDemoView } from '@src/app/scenes/gdmn/StompDemoView';

interface IDemosViewActionsProps {
  signOut: () => void;
  // webSocketConnect: () => void;
  // webSocketDisconnect: () => void;
}

type TGdmnViewStateProps = any; // TDataStoresState;

interface IGdmnViewProps extends IDemosViewActionsProps, TGdmnViewStateProps, InjectedProps {
  // renderDataStoresViewContainer?: React.ComponentType;
  // renderDatastoreViewContainer?: React.ComponentType;
  // getDatastoreViewContainer: (appBarPortalTargetRef: RefObject<HTMLDivElement>) => React.ComponentType;
  // getDemosContainer: (appBarPortalTargetRef: RefObject<HTMLDivElement>) => React.ComponentType;
  // loadDataStores: () => void; // TODO extract to container
}

const NotFoundView = () => <h2>GDMN: 404!</h2>;
const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

@CSSModules(styles, { allowMultiple: true })
class GdmnView extends PureComponent<IGdmnViewProps & RouteComponentProps<any> & InjectedCSSModuleProps> {
  private appBarPortalTargetRef: RefObject<HTMLDivElement> = React.createRef();

  public render() {
    const {
      match,
      // renderDataStoresViewContainer: DataStoresViewContainer,
      // renderDatastoreViewContainer: DatastoreViewContainer,
      // getDatastoreViewContainer,
      // getDemosContainer,
      signOut,
      // dataStores,
      breadcrumbs
    } = this.props;
    return (
      <div styleName="layout">
        <AppBar styleName="header" position="static">
          <Toolbar>
            <div styleName={'breadcrumbs'}>
              {breadcrumbs.map((breadcrumb: BreadcrumbsProps, index: number) => (
                <Typography variant="subheading" color="inherit" noWrap={true} key={breadcrumb.key}>
                  <NavLink to={breadcrumb.props.match.url}>
                    <Button styleName={'btn'} color="inherit" component={'div'}>
                      {breadcrumb}
                    </Button>
                  </NavLink>
                  {index < breadcrumbs.length - 1 && (
                    <Button style={{ padding: 0 }} disabled={true} styleName={'btn'} color="inherit" component={'div'}>
                      <i> ❯ </i>
                    </Button>
                  )}
                </Typography>
              ))}
            </div>
          </Toolbar>
          <div id="portalTarget" ref={this.appBarPortalTargetRef} />
        </AppBar>
        <Drawer styleName="nav" variant="permanent" anchor="left">
          <div style={{ minHeight: 64 }} />
          <Divider />
          {/*<List style={{ width: 240 }}>*/}
          {/*<NavLink to={`${match.url}/datastores`} activeClassName={'gdmn-nav-item-selected'}>*/}
          {/*<ListItem button={true}>*/}
          {/*<ListItemIcon>*/}
          {/*<Icon>dns</Icon>*/}
          {/*</ListItemIcon>*/}
          {/*<ListItemText primary="Datastores" />*/}
          {/*/!*{true ? <Icon>expand_less</Icon> : <Icon>expand_more</Icon>}*!/*/}
          {/*</ListItem>*/}
          {/*</NavLink>*/}
          {/*<Collapse in={true} timeout="auto" unmountOnExit={true}>*/}
          {/*<List component="div" disablePadding={true}>*/}
          {/*{dataStores &&*/}
          {/*dataStores.map(app => (*/}
          {/*<NavLink*/}
          {/*key={app.uid}*/}
          {/*to={`${match.url}/datastores/${app.uid}`}*/}
          {/*activeClassName={'gdmn-nav-item-selected'}*/}
          {/*>*/}
          {/*<ListItem button={true} dense={true} styleName={'gdmn-nav-item-nested'}>*/}
          {/*<ListItemIcon>*/}
          {/*<Icon>storage</Icon>*/}
          {/*</ListItemIcon>*/}
          {/*<ListItemText inset={true} primary={app.alias} />*/}
          {/*</ListItem>*/}
          {/*</NavLink>*/}
          {/*))}*/}
          {/*</List>*/}
          {/*</Collapse>*/}
          {/*</List>*/}
          {/*<Divider />*/}
          {/*<List style={{ width: 240 }}>*/}
          {/*<NavLink to={`${match.url}/demos`} activeClassName={'gdmn-nav-item-selected'}>*/}
          {/*<ListItem button={true}>*/}
          {/*<ListItemIcon>*/}
          {/*<Icon>ac_unit</Icon>*/}
          {/*</ListItemIcon>*/}
          {/*<ListItemText inset={true} primary="NLP demos" />*/}
          {/*</ListItem>*/}
          {/*</NavLink>*/}
          {/*<NavLink to={`${match.url}/stomp`} activeClassName={'gdmn-nav-item-selected'}>*/}
          {/*<ListItem button={true}>*/}
          {/*<ListItemIcon>*/}
          {/*<Icon>settings_ethernet</Icon>*/}
          {/*</ListItemIcon>*/}
          {/*<ListItemText inset={true} primary="Web-STOMP" />*/}
          {/*</ListItem>*/}
          {/*</NavLink>*/}
          {/*</List>*/}
          <Divider />
          <List style={{ width: 240 }}>
            <ListItem button={true} onClick={signOut}>
              <ListItemIcon>
                <Icon>exit_to_app</Icon>
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
        <main styleName={location.pathname.includes('/nlp') ? '' : 'scene-pad'}>
          <ErrBoundary>
            <Switch>
              {/*<Redirect exact={true} from={`${match.path}/`} to={`${match.path}/datastores`} />*/}
              {/*<Route exact={true} path={`${match.path}/datastores`} component={DataStoresViewContainer} />*/}
              {/*<Route*/}
              {/*path={`${match.path}/datastores/:appId`}*/}
              {/*component={getDatastoreViewContainer(this.appBarPortalTargetRef)}*/}
              {/*/>*/}
              {/*<Route path={`${match.path}/demos`} component={getDemosContainer(this.appBarPortalTargetRef)} />*/}
              {/*<Route path={`${match.path}/stomp`} component={StompDemoView} />*/}
              <Route path={`${match.path}/*`} component={NotFoundView} />
            </Switch>
          </ErrBoundary>
        </main>
        <footer />
      </div>
    );
  }
}

export { GdmnView, IGdmnViewProps, TGdmnViewStateProps };

/*
Organizations - supervised_user_circle
Account - alternate_email
Profile - account_circle
 */
