import React, { Fragment, Component } from 'react';
import { Route, RouteComponentProps, Switch, Link } from 'react-router-dom';
import CSSModules, { InjectedCSSModuleProps } from 'react-css-modules';
import { Icon } from 'office-ui-fabric-react/lib/components/Icon';
import { IconButton } from 'office-ui-fabric-react/lib/components/Button';
import { ContextualMenuItem, IContextualMenuItemProps } from 'office-ui-fabric-react/lib/components/ContextualMenu';
import { isDevMode, ErrorBoundary } from '@gdmn/client-core';
import { ERModel } from 'gdmn-orm';

import { IStompDemoViewProps, StompDemoView } from '@src/app/scenes/gdmn/components/StompDemoView';
import { AccountView, IAccountViewProps } from '@src/app/scenes/gdmn/components/AccountView';
import { commandsToContextualMenuItems, commandToLink } from '@src/app/services/uiCommands';
import { TAuthActions } from '@src/app/scenes/auth/actions';
import { ERModelViewContainer } from '@src/app/scenes/ermodel/ERModelViewContainer';
import { IQueryDemoViewProps, QueryDemoView } from '@src/app/scenes/gdmn/components/QueryDemoView';
import styles from './styles.css';
import { TGdmnActions } from './actions';
import { Dispatch } from 'redux';

type TGdmnViewStateProps = {
  erModel?: ERModel;
};
type TGdmnViewProps = IStompDemoViewProps &
  IQueryDemoViewProps &
  IAccountViewProps &
  TGdmnViewStateProps & {
    dispatch: Dispatch<any>; // TODO
  };

const NotFoundView = () => <h2>GDMN: 404!</h2>;
const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

@CSSModules(styles, { allowMultiple: true })
class GdmnView extends Component<TGdmnViewProps & RouteComponentProps<any> & InjectedCSSModuleProps> {
  public render() {
    const { match, history, dispatch, erModel, apiGetData, apiPing, apiDeleteAccount } = this.props;
    if (!match) return null; // todo

    return (
      <div className="App">
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
          <div className="ImportantMenu">{commandToLink('query', match.url)}</div>
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
        <main styleName="WorkArea">
          <ErrBoundary>
            <Switch>
              <Route
                path={`${match.path}/account`}
                component={() => <AccountView apiDeleteAccount={apiDeleteAccount} />}
              />
              <Route path={`${match.path}/web-stomp`} component={() => <StompDemoView apiPing={apiPing} log={''} />} />
              <Route
                path={`${match.path}/query`}
                component={() => <QueryDemoView apiGetData={apiGetData} erModel={erModel} />}
              />
              <Route path={`${match.path}/er-model`} component={ERModelViewContainer} />
              <Route path={`${match.path}/*`} component={NotFoundView} />
            </Switch>
          </ErrBoundary>
        </main>
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
