import React, { Fragment, Component } from 'react';
import { Route, RouteComponentProps, Switch, Link } from 'react-router-dom';
import CSSModules, { InjectedCSSModuleProps } from 'react-css-modules';
import { InjectedProps } from 'react-router-breadcrumbs-hoc';
import { isDevMode, ErrorBoundary } from '@gdmn/client-core';
import { IStompDemoViewProps, StompDemoView } from '@src/app/scenes/gdmn/components/StompDemoView';
import { AccountView, IAccountViewProps } from '@src/app/scenes/gdmn/components/AccountView';
import {
  Icon,
  IconButton,
  IContextualMenuItemProps,
  ContextualMenuItem
} from 'office-ui-fabric-react';
import styles from './styles.css';
import { commandsToContextualMenuItems, commandToLink } from '@src/app/services/uiCommands';
import { TAuthActions } from '../auth/actions';
import { TGdmnActions } from './actions';
import { ERModelView } from './components/ERModelView';

type TGdmnViewStateProps = any;
type TGdmnViewProps = IStompDemoViewProps & IAccountViewProps & TGdmnViewStateProps & InjectedProps;

const NotFoundView = () => <h2>GDMN: 404!</h2>;
const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

@CSSModules(styles, { allowMultiple: true })
class GdmnView extends Component<TGdmnViewProps & RouteComponentProps<any> & InjectedCSSModuleProps> {
  public render() {
    const { match, history, dispatch, erModel } = this.props;

    return (
      <div className="App">
        <div className="Header">
          <Link to="/"><Icon iconName="Home" className="RoundIcon" /></Link>
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
              iconProps={{ iconName: 'Contact'}}
              styles={{ menuIcon: { display: 'none' } }}
              className="RoundIcon"
              menuProps={{
                shouldFocusOnMount: true,
                gapSpace: 2,
                isBeakVisible: true,
                contextualMenuItemAs: (props: IContextualMenuItemProps) => {
                  return props.item.link ? <Link to={props.item.link}><ContextualMenuItem {...props} /></Link> : <ContextualMenuItem {...props} />;
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
                component={() => <AccountView apiDeleteAccount={this.props.apiDeleteAccount} />}
              />
              <Route
                path={`${match.path}/web-stomp`}
                component={() => <StompDemoView apiPing={this.props.apiPing} log={''} />}
              />
              <Route
                path={`${match.path}/er-model`}
                component={() => <ERModelView erModel={erModel} />}
              />
              <Route path={`${match.path}/*`} component={NotFoundView} />
            </Switch>
          </ErrBoundary>
        </main>
      </div>
    );
  }
};

export { GdmnView, TGdmnViewProps, TGdmnViewStateProps };

/*
Organizations - supervised_user_circle
Account - alternate_email
Profile - account_circle
*/

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
