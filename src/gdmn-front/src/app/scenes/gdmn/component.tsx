import React, { Fragment, PureComponent } from 'react';
import { NavLink, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import CSSModules, { InjectedCSSModuleProps } from 'react-css-modules';
import { BreadcrumbsProps, InjectedProps } from 'react-router-breadcrumbs-hoc';

import styles from './styles.css';
import { isDevMode, ErrorBoundary, LinkCommandBarButton } from '@gdmn/client-core';
import { IStompDemoViewProps, StompDemoView } from '@src/app/scenes/gdmn/components/StompDemoView';
import { AccountView, IAccountViewProps } from '@src/app/scenes/gdmn/components/AccountView';
import { Breadcrumb, IComponentAsProps, IBreadcrumbItem, CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';

type TGdmnViewStateProps = any;
type TGdmnViewProps = IStompDemoViewProps & IAccountViewProps & TGdmnViewStateProps & InjectedProps;

const NotFoundView = () => <h2>GDMN: 404!</h2>;
const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

interface IBreadcrumbItemWithLink extends IBreadcrumbItem {
  link: string;
}

@CSSModules(styles, { allowMultiple: true })
class GdmnView extends PureComponent<TGdmnViewProps & RouteComponentProps<any> & InjectedCSSModuleProps> {
  public render() {
    const { match, breadcrumbs } = this.props;

    return (
      <div styleName="layout">
        <div>
          nav...
        </div>
        <div>
          <CommandBar
            items={this.getItems()}
          />
          <Breadcrumb
            onRenderItem = { (props, defaultRenderer) => <NavLink to={(props as IBreadcrumbItemWithLink).link}>{defaultRenderer!(props)}</NavLink> }
            items = {
              breadcrumbs.map((breadcrumb: BreadcrumbsProps) => (
                {
                  key: breadcrumb.key,
                  text: breadcrumb,
                  link: breadcrumb.props.match.url
                }
              ))
            }
          />
        </div>
        <main styleName="scene-pad">
          <ErrBoundary>
            <Switch>
              <Redirect exact={true} from={`${match.path}/`} to={`${match.path}/account`} />
              <Route
                path={`${match.path}/account`}
                component={() => <AccountView apiDeleteAccount={this.props.apiDeleteAccount} />}
              />
              <Route
                path={`${match.path}/web-stomp`}
                component={() => <StompDemoView apiPing={this.props.apiPing} log={''} />}
              />
              <Route path={`${match.path}/*`} component={NotFoundView} />
            </Switch>
          </ErrBoundary>
        </main>
        <footer />
      </div>
    );
  }

  private getItems = (): ICommandBarItemProps[] => {
    const { erModel, match, signOut, apiGetSchema } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };

    return [
      {
        key: 'Account',
        text: 'Account',
        commandBarButtonAs: btn(`${match.url}/account`)
      },
      {
        key: 'WebStomp',
        text: 'web-stomp',
        commandBarButtonAs: btn(`${match.url}/web-stomp`)
      },
      {
        key: 'Logout',
        text: 'Logout',
        onClick: signOut
      },
      {
        key: 'GetERModel',
        text: Object.keys(erModel.entities).length ? `Reload ERModel (${Object.keys(erModel.entities).length})` : `Load ERModel`,
        onClick: apiGetSchema
      }
    ];
  }
}

export { GdmnView, TGdmnViewProps, TGdmnViewStateProps };

/*
Organizations - supervised_user_circle
Account - alternate_email
Profile - account_circle
 */
