import React, { Fragment, Component } from 'react';
import { NavLink, Route, RouteComponentProps, Switch, Link } from 'react-router-dom';
import CSSModules, { InjectedCSSModuleProps } from 'react-css-modules';
import { BreadcrumbsProps, InjectedProps } from 'react-router-breadcrumbs-hoc';
import { isDevMode, ErrorBoundary, ContextualMenuItemWithLink } from '@gdmn/client-core';
import { IStompDemoViewProps, StompDemoView } from '@src/app/scenes/gdmn/components/StompDemoView';
import { AccountView, IAccountViewProps } from '@src/app/scenes/gdmn/components/AccountView';
import {
  Breadcrumb,
  IComponentAsProps,
  IBreadcrumbItem,
  CommandBar,
  ICommandBarItemProps,
  Icon,
  IconButton,
  IContextualMenuItemProps,
  ContextualMenuItem
} from 'office-ui-fabric-react';
import styles from './styles.css';
import { commandsToContextualMenuItems } from '@src/app/services/uiCommands';
import { TAuthActions } from '../auth/actions';

type TGdmnViewStateProps = any;
type TGdmnViewProps = IStompDemoViewProps & IAccountViewProps & TGdmnViewStateProps & InjectedProps;

const NotFoundView = () => <h2>GDMN: 404!</h2>;
const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

@CSSModules(styles, { allowMultiple: true })
class GdmnView extends Component<TGdmnViewProps & RouteComponentProps<any> & InjectedCSSModuleProps> {
  public render() {
    const { match, breadcrumbs, history, dispatch } = this.props;

    return (
      <div className="App">
        <div className="Header">
          <Icon iconName="Home" className="RoundIcon" />
          <Icon iconName="Chat" className="NoFrameIcon" />
          <div className="SearchBox">
            find something...
            <span className="WhereToSearch">/</span>
          </div>
          <div className="ImportantMenu">Lorem</div>
          <div className="ImportantMenu">Ipsum</div>
          <div className="ImportantMenu">Diem</div>
          <div className="RightSideHeaderPart">
            <span className="BigLogo">
              <b>
                <i>#GDMN</i>
              </b>{' '}
              &mdash; Березовский мясоконсервный комбинат
            </span>
            <span className="WithNotificationsCount">
              <Icon iconName="Ringer" className="NoFrameIcon" />
              <span className="NotificationsCount">4</span>
            </span>
            <IconButton
              iconProps={{ iconName: 'Contact'}}
              styles={{
                rootHovered: {
                  color: 'lightblue'
                },
                menuIcon: {
                  display: 'none'
                }
              }}
              className="RoundIcon"
              menuProps={{
                shouldFocusOnMount: true,
                gapSpace: 2,
                isBeakVisible: true,
                contextualMenuItemAs: (props: IContextualMenuItemProps) => {
                  console.log(`link -- ${props.item.link}`);
                  return props.item.link ? <Link to={props.item.link}><ContextualMenuItem {...props} /></Link> : <ContextualMenuItem {...props} />;
                },
                items: commandsToContextualMenuItems(
                  ['userProfile', '-', 'logout'],
                  (action: TAuthActions) => dispatch(action),
                  (link: string) => history.push(`${match.url}${link}`)
                )
              }}
            />
          </div>
        </div>
        <div className="OpenTasks">
          <span className="RegularTask">
            Накладные на приход
            <Icon iconName="BoxMultiplySolid" className="CloseTask" />
          </span>
          <span className="CurrentTask">
            Текущий документ
            <Icon iconName="BoxMultiplySolid" className="CloseTask" />
          </span>
          <span className="ProgressTask">
            <span className="ProgressIndicator" />
            Длительный отчет строится
            <Icon iconName="BoxMultiplySolid" className="CloseTask" />
          </span>
          <span className="RegularTask">
            Счета-фактуры
            <Icon iconName="BoxMultiplySolid" className="CloseTask" />
          </span>
          <span className="AttentionTask">
            Отчет уже построен
            <Icon iconName="BoxMultiplySolid" className="CloseTask" />
          </span>
        </div>
        <div className="BPSeq">
          <span>Приход сырья</span>
          <Icon iconName="ChromeBackMirrored" className="BPArrow" />
          <span>
            <b>Хранение</b>
          </span>
          <Icon iconName="ChromeBackMirrored" className="BPArrow" />
          <span>
            Производство
            <span className="SubMenu">
              <div>Украли</div>
              <div>Испортилось</div>
              <div>Продали</div>
            </span>
          </span>
          <Icon iconName="ChromeBackMirrored" className="BPArrow" />
          <span>Приход ГП</span>
          <Icon iconName="ChromeBackMirrored" className="BPArrow" />
          <span>Отгрузка</span>
        </div>

        <div>
          <CommandBar items={this.getItems()} />
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
        </div>
        <main styleName="scene-pad">
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
              <Route path={`${match.path}/*`} component={NotFoundView} />
            </Switch>
          </ErrBoundary>
        </main>
      </div>
    );
  }

  private getItems = (): ICommandBarItemProps[] => {
    const { erModel, match, apiGetSchema } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => (
      <ContextualMenuItemWithLink {...props} link={link} supText={supText} />
    );

    return [
      {
        key: 'WebStomp',
        text: 'web-stomp',
        commandBarButtonAs: btn(`${match.url}/web-stomp`)
      },
      {
        key: 'GetERModel',
        text: Object.keys(erModel.entities).length
          ? `Reload ERModel (${Object.keys(erModel.entities).length})`
          : `Load ERModel`,
        onClick: apiGetSchema
      }
    ];
  };
}

export { GdmnView, TGdmnViewProps, TGdmnViewStateProps };

/*
Organizations - supervised_user_circle
Account - alternate_email
Profile - account_circle
 */
