import React, { Fragment, useMemo } from 'react';
import { Link, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Icon } from 'office-ui-fabric-react/lib/components/Icon';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/components/Button';
import { gdmnActionsAsync, gdmnActions } from "@src/app/scenes/gdmn/actions";
import { ContextualMenuItem, IContextualMenuItemProps } from 'office-ui-fabric-react/lib/components/ContextualMenu';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Dispatch } from 'redux';
import { ErrorBoundary, isDevMode } from '@gdmn/client-core';
import { commandsToContextualMenuItems, commandToLink } from '@src/app/services/uiCommands';
import { ViewTabsContainer } from '@src/app/components/ViewTab/ViewTabsContainer';
import { StompDemoViewContainer } from './components/StompDemoViewContainer';
import { SqlContainer } from '../sql/SqlContainer';
import { AccountViewContainer } from './components/AccountViewContainer';
import { ERModelBoxContainer } from '../ermodel2/ERModelBoxContainer';
import { InternalsContainer } from '../internals/container';
import { rootActions } from '../root/actions';
import { MessageBar, MessageBarType, getTheme, Stack, Label } from 'office-ui-fabric-react';
import { LostConnectWarnMsgBar } from './components/LostConnectWarnMsgBar';
import { ApplicationsViewContainer } from './components/ApplicationsViewContainer';
import { IApplicationInfo } from '@gdmn/server-api';
import { EntityDataDlgContainer } from '../ermodel/EntityDataDlg/EntityDataDlgContainer';
import { IEntityDataDlgRouteProps } from '../ermodel/EntityDataDlg/EntityDataDlg.types';
import { EntityDataViewContainer } from '../ermodel/EntityDataView/EntityDataViewContainer';
import { ERModelView2Container } from '../ermodel/ERModelView2Container';
import { BPContainer } from '../bp/BPContainer';
import { ThemeEditorContainer } from '../themeeditor/ThemeEditorContainer';
import { themes } from '../themeeditor/themes';
import { EntityDlgContainer } from '../ermodel/Entity/EntityDlg/EntityDlg2Container';
import { NLPDialogScroll } from './components/NLPDialogScroll';
import { NLPDialog } from 'gdmn-nlp-agent';
import { IMorphologyRouteProps } from '../nlp/morphology/Morphology.types';
import { MorphologyContainer } from '../nlp/morphology/MorphologyContainer';
import { ISyntaxRouteProps } from '../nlp/syntax/Syntax.types';
import { SyntaxContainer } from '../nlp/syntax/SyntaxContainer';

export interface IGdmnViewProps extends RouteComponentProps<any> {
  loading: boolean;
  loadingMessage?: string;
  errorMessage?: string[];
  lostConnectWarnOpened: boolean;
  dispatch: Dispatch<any>;
  application?: IApplicationInfo;
  theme: string;
  nlpDialog: NLPDialog;
};

const NotFoundView = () => <h2>GDMN: 404!</h2>;
const ErrBoundary = !isDevMode() ? ErrorBoundary : Fragment;

//@CSSModules(styles, { allowMultiple: true })
export function GdmnView (props: IGdmnViewProps) {
  const { match, history, dispatch, loading, location, errorMessage, lostConnectWarnOpened, theme, nlpDialog } = props;
  if (!match) return null;

  const topAreaHeight = 56 + /* 36 + */ ((errorMessage && errorMessage.length > 0) ? 48 : 0) + (lostConnectWarnOpened ? 48 : 0);
  const homeButton = props.application
    ? (
      <Icon
        data-is-focusable={true}
        iconName="Home"
        className="RoundIcon"
        onClick={() => {
          props.history.push(match.path);
          props.dispatch(gdmnActionsAsync.reconnectToApp())
        }}
        styles={{
          root: {
            selectors: {
              ':hover': {
                color: getTheme().palette.themeTertiary
              }
            }
          }
        }}
      />
    )
    : (
      <Link to={`${match.path}`}>
        <Icon iconName="Home" className="RoundIcon"/>
      </Link>
    );

  const importantMenu = (link: JSX.Element, hidden: boolean = false) => (
    hidden ? null : <Label
      disabled={!!props.application}
      styles={{
        root: {
          fontWeight: 700,
          marginBottom: '7px',
          marginRight: '12px',
          selectors: {
            ':hover': {
              color: getTheme().palette.themeTertiary
            }
          }
        }
      }}
    >
      {link}
    </Label>
  );

  const memoizedStyles = useMemo( () => {
    const namedTheme = themes.find( t => t.name === theme );

    if (namedTheme && namedTheme.theme.isInverted) {
      return {
        stackStyles: {
          root: {
            //backgroundColor: 'transparent',
            color: getTheme().semanticColors.bodyText,
          }
        },
        iconButtonStyles: {
          menuIcon: { display: 'none' },
          rootHovered: {
            //backgroundColor: 'transparent',
            color: getTheme().palette.themeTertiary
          },
          rootExpanded: {
            //backgroundColor: 'transparent',
            color: getTheme().palette.neutralLight
          },
          rootPressed: {
            //backgroundColor: 'transparent',
            color: getTheme().palette.themeTertiary
          },
          root: {
            //backgroundColor: 'transparent',
            color: getTheme().semanticColors.bodyText
          }
        } as IButtonStyles
      }
    } else {
      return {
        stackStyles: {
          root: {
            backgroundColor: getTheme().palette.themeDarker,
            color: getTheme().palette.neutralLight
          }
        },
        iconButtonStyles: {
          menuIcon: { display: 'none' },
          rootHovered: {
            backgroundColor: 'transparent',
            color: getTheme().palette.themeTertiary
          },
          rootExpanded: {
            backgroundColor: 'transparent',
            color: getTheme().palette.neutralLight
          },
          rootPressed: {
            backgroundColor: 'transparent',
            color: getTheme().palette.themeTertiary
          },
          root: {
            backgroundColor: 'transparent',
            color: getTheme().palette.neutralLight
          }
        } as IButtonStyles
      }
    }
  }, [theme] );

  return (
    <>
      <div
        className="TopArea"
        style={{
          height: topAreaHeight ,
          backgroundColor: getTheme().semanticColors.bodyBackground,
        }}
      >
        <Stack
          className="Header"
          styles={memoizedStyles.stackStyles}
        >
          {homeButton}
          <Icon iconName="Chat" className="NoFrameIcon" />
          <div className="SearchBox">
            find something...
            <span className="WhereToSearch">/</span>
          </div>
          {importantMenu(commandToLink('applications', match.url), !!props.application)}
          {importantMenu(commandToLink('webStomp', match.url))}
          {importantMenu(commandToLink('bp', match.url))}
          {importantMenu(commandToLink('erModel', match.url))}
          {importantMenu(commandToLink('erModel2', match.url))}
          {importantMenu(commandToLink('internals', match.url))}
          {importantMenu(commandToLink('sql', match.url))}
          <div className="RightSideHeaderPart">
            <div>
              <span className="BigLogo">
                <b>
                  <i>#GDMN</i>
                </b>{' '}
                &mdash; революционная платформа
              </span>
              <div>
                Подключение к базе{props.application ? ': ' + props.application.alias : ' авторизации'}
              </div>
            </div>
            <span className="WithNotificationsCount">
              <Icon iconName="Ringer" className="NoFrameIcon" />
              <span className="NotificationsCount">4</span>
            </span>
            <IconButton
              //style={{ backgroundColor: 'transparent' }}
              iconProps={{ iconName: 'Contact' }}
              styles={memoizedStyles.iconButtonStyles}
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
                  ['userProfile', 'themeEditor', '-', 'logout'],
                  action => dispatch(action),
                  (link: string) => history.push(`${match.url}${link}`)
                )
              }}
            />
          </div>
        </Stack>
        {
          loading ?
            <ProgressIndicator
              styles={{ itemProgress: { padding: 0 } }}
              barHeight={4}
              description={props.loadingMessage}
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
      </div>
      <main
        className="WorkArea"
        style={{
          height: `calc(100vh - ${topAreaHeight}px)`,
          maxWidth: '100%',
          backgroundColor: getTheme().semanticColors.bodyBackground,
          color: getTheme().semanticColors.bodyText
        }}
      >
        <ErrBoundary>
          <Stack horizontal styles={{ root: { height: '100%' } }}>
            <Stack.Item styles={{ root: { minWidth: '240px' } }}>
              <NLPDialogScroll nlpDialog={nlpDialog} addNLPMessage={ text => dispatch(gdmnActions.nlpProcess({ item: { who: 'me', text }, history })) }/>
            </Stack.Item>
            <Stack.Item grow={1} styles={{ root: { height: 'calc(100% - 36px)' } }}>
              <ViewTabsContainer history={history} match={match} location={location} />
              <Switch>
                {
                  !props.application
                  ? <Redirect exact={true} from={`${match.path}`} to={`${match.path}/applications`} />
                  : <Redirect exact={true} from={`${match.path}/applications`} to={`${match.path}`} />
                }
                  <Route
                    path={`${match.path}/account`}
                    render={props => (
                      <AccountViewContainer
                        {...props}
                        url={props.match.url}
                      />
                    )}
                  />
                  <Route
                    path={`${match.path}/applications`}
                    render={props => {
                      return (
                        <ApplicationsViewContainer
                        {...props}
                        />
                      );
                    }}
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
                    path={`${match.path}/bp`}
                    render={props => {
                      return (
                        <BPContainer
                          {...props}
                          url={props.match.url}
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
                        //<ERModelViewContainer {...props} />
                        <ERModelView2Container {...props} />
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
                        <SqlContainer
                          {...props}
                          url={props.match.url}
                          id="SQL"
                          key="SQL"
                        />
                      );
                    }}
                  />
                  <Route
                    exact={false}
                    path={`${match.path}/sql/:id`}
                    render={props => {
                      return (
                        <SqlContainer
                          {...props}
                          key={props.match.url}
                          url={props.match.url}
                          id={props.match.params.id}
                        />
                      );
                    }}
                  />
                  <Route
                    exact={true}
                    path={`${match.path}/themeEditor`}
                    render={props => (
                      <ThemeEditorContainer
                        {...props}
                        url={props.match.url}
                      />
                    )}
                  />
                  <Route
                    exact={true}
                    path={`${match.path}/entityDlg/:entityName`}
                    render={props => (
                      <EntityDlgContainer
                        {...props}
                        entityName={props.match.params.entityName}
                        url={props.match.url}
                      />
                    )}
                  />
                  <Route
                    exact={true}
                    path={`${match.path}/entityDlg/create/:uniqueID`}
                    render={props => (
                      <EntityDlgContainer
                        {...props}
                        uniqueID={props.match.params.uniqueID}
                        url={props.match.url}
                        createEntity
                      />
                    )}
                  />
                  <Route
                    exact={true}
                    path={`${match.path}/entity/:entityName`}
                    render={props => (
                      <EntityDataViewContainer
                        {...props}
                        key={props.match.url}
                        entityName={props.match.params.entityName}
                        url={props.match.url}
                      />
                    )}
                  />
                  <Route
                    path={`${match.path}/entity/:entityName/add/:id`}
                    render={ (props: RouteComponentProps<IEntityDataDlgRouteProps>) => (
                      <EntityDataDlgContainer
                        {...props}
                        key={props.match.url}
                        entityName={props.match.params.entityName}
                        id={props.match.params.id}
                        url={props.match.url}
                        newRecord={true}
                      />
                    )}
                  />
                  <Route
                    path={`${match.path}/entity/:entityName/edit/:id`}
                    render={ (props: RouteComponentProps<IEntityDataDlgRouteProps>) => (
                      <EntityDataDlgContainer
                        {...props}
                        key={props.match.url}
                        entityName={props.match.params.entityName}
                        id={props.match.params.id}
                        url={props.match.url}
                        newRecord={false}
                      />
                    )}
                  />
                  <Route
                    path={`${match.path}/syntax`}
                    exact={true}
                    render={ (props: RouteComponentProps<ISyntaxRouteProps>) => (
                      <SyntaxContainer
                        {...props}
                        url={props.match.url}
                        key={props.match.url}
                      />
                    )}
                  />
                  <Route
                    path={`${match.path}/morphology`}
                    exact={true}
                    render={ (props: RouteComponentProps<IMorphologyRouteProps>) => (
                      <MorphologyContainer
                        {...props}
                        url={props.match.url}
                        key={props.match.url}
                      />
                    )}
                  />
                  <Route
                    path={`${match.path}/morphology/:word`}
                    render={ (props: RouteComponentProps<IMorphologyRouteProps>) => (
                      <MorphologyContainer
                        {...props}
                        url={props.match.url}
                        word={props.match.params.word}
                        key={props.match.url}
                      />
                    )}
                  />
                  <Route path={`${match.path}/*`} component={NotFoundView} />
                </Switch>
              </Stack.Item>
            </Stack>
          </ErrBoundary>
      </main>
    </>
  );
}
