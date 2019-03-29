import React, { Component, Fragment } from 'react';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Icon } from 'office-ui-fabric-react/lib/components/Icon';
import { IconButton } from 'office-ui-fabric-react/lib/components/Button';
import { ContextualMenuItem, IContextualMenuItemProps } from 'office-ui-fabric-react/lib/components/ContextualMenu';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Dispatch } from 'redux';
import { ErrorBoundary, isDevMode } from '@gdmn/client-core';
import { commandsToContextualMenuItems, commandToLink } from '@src/app/services/uiCommands';
import { ERModelViewContainer } from '@src/app/scenes/ermodel/container';
import { ViewTabsContainer } from '@src/app/components/ViewTab/ViewTabsContainer';
import { EntityDataViewContainer } from '../ermodel/entityData/EntityDataViewContainer';
import { StompDemoViewContainer } from './components/StompDemoViewContainer';
import { SqlViewContainer } from '../sql/container';
import { SqlDataViewContainer } from '../sql/data/SqlDataViewContainer';
import { AccountViewContainer } from './components/AccountViewContainer';
import { DlgViewContainer } from '../ermodel/DlgView/DlgViewContainer';
import { ERModelBoxContainer } from '../ermodel2/ERModelBoxContainer';
import { InternalsContainer } from '../internals/container';
import { rootActions } from '../root/actions';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { LostConnectWarnMsgBar } from './components/LostConnectWarnMsgBar';

export interface IGdmnViewProps extends RouteComponentProps<any> {
  loading: boolean;
  loadingMessage?: string;
  errorMessage?: string[];
  lostConnectWarnOpened: boolean;
  dispatch: Dispatch<any>;
};

const NotFoundView = () => <h2>GDMN: 404!</h2>;
const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

//@CSSModules(styles, { allowMultiple: true })
export class GdmnView extends Component<IGdmnViewProps, {}> {
  public render() {
    const { match, history, dispatch, loading, location, errorMessage, lostConnectWarnOpened } = this.props;
    if (!match) return null;

    const topAreaHeight = 56 + 36 + ((errorMessage && errorMessage.length > 0) ? 48 : 0) + (lostConnectWarnOpened ? 48 : 0);

    return (
      <>
        <div className="TopArea" style={{ height: topAreaHeight }}>
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
            <div className="ImportantMenu">{commandToLink('erModel2', match.url)}</div>
            <div className="ImportantMenu">{commandToLink('internals', match.url)}</div>
            <div className="ImportantMenu">{commandToLink('sql', match.url)}</div>
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
                    action => dispatch(action),
                    (link: string) => history.push(`${match.url}${link}`)
                  )
                }}
              />
            </div>
          </div>
          {
            loading ?
              <ProgressIndicator
                styles={{ itemProgress: { padding: 0 } }}
                barHeight={4}
                description={this.props.loadingMessage}
              />
            : undefined
          }
          {
            (errorMessage && errorMessage.length > 0) ?
              <MessageBar
                messageBarType={MessageBarType.error}
                isMultiline={false}
                onDismiss={() => dispatch(rootActions.hideMessage())}
                dismissButtonAriaLabel="Close"
              >
                {errorMessage.join(', ')}
              </MessageBar>
            : undefined
          }
          {
            lostConnectWarnOpened ?
              <LostConnectWarnMsgBar
                onDismiss={ () => dispatch(rootActions.setLostConnectWarnOpened(false)) }
                onYesAction={ () => dispatch(rootActions.abortNetReconnect()) }
              />
            : undefined
          }
          <ViewTabsContainer history={history} match={match} location={location} />
        </div>
        <main className="WorkArea" style={{ paddingTop: topAreaHeight, marginTop: -topAreaHeight }}>
          <ErrBoundary>
            <Switch>
              <Route
                path={`${match.path}/account`}
                render={props => (
                  <AccountViewContainer
                    {...props}
                  />
                )}
              />
              <Route
                path={`${match.path}/web-stomp`}
                render={props => {
                  return (
                    <StompDemoViewContainer
                      {...props}
                    />
                  );
                }}
              />
              <Route
                path={`${match.path}/internals`}
                render={props => {
                  return (
                    <InternalsContainer {...props} />
                  );
                }}
              />
              <Route
                path={`${match.path}/er-model`}
                render={props => {
                  return (
                    <ERModelViewContainer {...props} />
                  );
                }}
              />
              <Route
                path={`${match.path}/er-model2`}
                render={props => {
                  return (
                    <ERModelBoxContainer {...props} />
                  );
                }}
              />
              <Route
                exact={true}
                path={`${match.path}/sql`}
                render={props => {
                  return (
                    <SqlViewContainer {...props} />
                  );
                }}
              />
              <Route
                path={`${match.path}/sql/:id`}
                render={props => {
                  return (
                    <SqlDataViewContainer {...props} />
                  );
                }}
              />
              <Route
                exact={true}
                path={`${match.path}/entity/:entityName`}
                render={props => (
                  <EntityDataViewContainer
                    {...props}
                  />
                )}
              />
              {
              <Route
                path={`${match.path}/entity/:entityName/edit/:pkSet`}
                render={props => (
                  <DlgViewContainer {...props} />
                )}
              />
                /*
              <Route
                path={`${match.path}/entity/:entityName/add`}
                render={props => (
                  <div style={{ margin: -16 }}>
                    <DlgViewContainer {...props}
                      updateViewTab={updateViewTab}
                      viewTab={viewTabs.find( vt => vt.url === props.match.url )}
                      dlgState={IDlgState.dsInsert}
                    />
                  </div>
                )}
              />
                */
              }
              <Route path={`${match.path}/*`} component={NotFoundView} />
            </Switch>
          </ErrBoundary>
        </main>
      </>
    );
  }
}
