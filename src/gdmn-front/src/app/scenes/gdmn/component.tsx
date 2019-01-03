import React, { Component, Fragment } from 'react';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import CSSModules, { InjectedCSSModuleProps } from 'react-css-modules';
import { Icon } from 'office-ui-fabric-react/lib/components/Icon';
import { IconButton } from 'office-ui-fabric-react/lib/components/Button';
import { ContextualMenuItem, IContextualMenuItemProps } from 'office-ui-fabric-react/lib/components/ContextualMenu';
import { ErrorBoundary, isDevMode } from '@gdmn/client-core';
import { ERModel } from 'gdmn-orm';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Dispatch } from 'redux';

import { IStompDemoViewProps, StompDemoView } from '@src/app/scenes/gdmn/components/StompDemoView';
import { AccountView, IAccountViewProps } from '@src/app/scenes/gdmn/components/AccountView';
import { commandsToContextualMenuItems, commandToLink } from '@src/app/services/uiCommands';
import { TAuthActions } from '@src/app/scenes/auth/actions';
import { ERModelViewContainer } from '@src/app/scenes/ermodel/container';
import styles from './styles.css';
import { TGdmnActions } from './actions';
import { EntityDataViewContainer } from '../ermodel/entityData/EntityDataViewContainer';
import { IViewTab } from './types';
import { ViewTabs } from '@src/app/components/ViewTab/ViewTabs';
import { ViewTabsContainer } from '@src/app/components/ViewTab/ViewTabsContainer';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react';

type TGdmnViewStateProps = {
  erModel: ERModel;
  loading: boolean;
  loadingMessage?: string;
  viewTabs: IViewTab[];
  onCloseTab: (url: string) => void;
};

type TGdmnViewProps = IStompDemoViewProps &
  IAccountViewProps &
  TGdmnViewStateProps & {
    dispatch: Dispatch<any>; // TODO
  };

const NotFoundView = () => <h2>GDMN: 404!</h2>;
const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

@CSSModules(styles, { allowMultiple: true })
class GdmnView extends Component<TGdmnViewProps & RouteComponentProps<any> & InjectedCSSModuleProps> {
  public render() {
    const {
      match,
      history,
      dispatch,
      erModel,
      apiGetData,
      apiPing,
      apiDeleteAccount,
      loading,
      onError,
      addToTabList,
      location,
      viewTabs
    } = this.props;
    if (!match) return null; // todo

    return (
      <div className="App" style={{ height: '100%', overflow: 'auto' }}>
        <Sticky stickyPosition={StickyPositionType.Header}>
        <div className="Header">
          <Link to={`${match.path}`}>
            <Icon iconName="Home" className="RoundIcon" />
          </Link>
          <Icon iconName="Chat" className="NoFrameIcon" />
          <div className="SearchBox">
            find something...
            <span className="WhereToSearch">/</span>
          </div>
          <div className="ImportantMenu">{commandToLink('webStomp', match.url)}</div>
          <div className="ImportantMenu">{commandToLink('erModel', match.url)}</div>
          <div className="RightSideHeaderPart">
            <span className="BigLogo">
              <b>
                <i>#GDMN</i>
              </b>{' '}
              &mdash; революционная платформа
            </span>
            <span className="WithNotificationsCount">
              <Icon iconName="Ringer" className="NoFrameIcon" />
              <span className="NotificationsCount">4</span>
            </span>
            <IconButton
              style={{ backgroundColor: 'transparent' }}
              iconProps={{ iconName: 'Contact' }}
              styles={{ menuIcon: { display: 'none' } }}
              className="RoundIcon"
              menuProps={{
                shouldFocusOnMount: true,
                gapSpace: 2,
                isBeakVisible: true,
                contextualMenuItemAs: (props: IContextualMenuItemProps) => {
                  return props.item.link ? (
                    <Link to={props.item.link}>
                      <ContextualMenuItem {...props} />
                    </Link>
                  ) : (
                    <ContextualMenuItem {...props} />
                  );
                },
                items: commandsToContextualMenuItems(
                  ['userProfile', '-', 'logout'],
                  (action: TAuthActions | TGdmnActions) => dispatch(action),
                  (link: string) => history.push(`${match.url}${link}`)
                )
              }}
            />
          </div>
        </div>
        <ProgressIndicator
          styles={{ itemProgress: { padding: 0, visibility: loading ? 'visible' : 'hidden' } }}
          barHeight={4}
          description={this.props.loadingMessage}
        />
      </Sticky>
        <ViewTabsContainer history={history} match={match} location={location} />
        {/*<ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>*/}
        <main styleName="WorkArea" style={{ padding: 16 }}>
          <ErrBoundary>
            <Switch>
              <Route
                path={`${match.path}/account`}
                render={
                  props =>
                    <AccountView
                      apiDeleteAccount={apiDeleteAccount}
                      addToTabList={addToTabList}
                      viewTabs={viewTabs}
                      {...props}
                    />
                }
              />
              <Route
                path={`${match.path}/web-stomp`}
                render={props => (
                  <StompDemoView
                    apiPing={apiPing}
                    apiGetData={apiGetData}
                    erModel={erModel}
                    addToTabList={addToTabList}
                    viewTabs={viewTabs}
                    {...props}
                    onError={onError}
                  />
                )}
              />
              <div style={{ margin: -16 }}>
              <Route
                path={`${match.path}/er-model`}
                render={props =>
                  <ERModelViewContainer
                    {...props}
                  />
                }
              />
              <Route
                path={`${match.path}/entity/:entityName`}
                render={props =>
                  <EntityDataViewContainer
                    {...props}
                  />
                }
              />
              </div>
              <Route path={`${match.path}/*`} component={NotFoundView} />
            </Switch>
          </ErrBoundary>
        </main>
        {/*</ScrollablePane>*/}
      </div>
    );
  }
}

export { GdmnView, TGdmnViewProps, TGdmnViewStateProps };

/*
          <Breadcrumb
            onRenderItem={(props, defaultRenderer) => {
              if (defaultRenderer && props && props.href) {
                return (
                  <NavLink to={props.href}>{defaultRenderer!(props)}</NavLink>
                )
              } else {
                return null;
              }
            }}

            items={breadcrumbs.map((breadcrumb: BreadcrumbsProps): IBreadcrumbItem => ({
              key: breadcrumb.key,
              text: breadcrumb.key,
              href: breadcrumb.props.match.url
            }))}
          />
*/
