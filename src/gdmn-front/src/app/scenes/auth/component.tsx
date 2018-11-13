import React, { ReactType, Fragment } from 'react';
import CSSModules from 'react-css-modules';
import { Link, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Paper, LinearProgress, Typography, Tab, Tabs } from '@material-ui/core';

import styles from './styles.css';

interface IAuthViewStateProps {
  signInFormSubmitting: boolean;
  signUpFormSubmitting: boolean;
}

interface IAuthViewProps extends IAuthViewStateProps, RouteComponentProps<any> {
  renderSignInFormContainer: ReactType;
  renderSignUpFormContainer: ReactType;
}

@CSSModules(styles, { allowMultiple: true })
class AuthView extends React.Component<IAuthViewProps> {
  constructor(props: IAuthViewProps) {
    super(props);

    this.getSignInView = this.getSignInView.bind(this);
    this.getSignUpView = this.getSignUpView.bind(this);
    this.renderSignInView = this.renderSignInView.bind(this);
    this.renderSignUpView = this.renderSignUpView.bind(this);
  }

  private getSignInView() {
    const { signInFormSubmitting, renderSignInFormContainer: SignInFormContainer } = this.props;

    return (
      <Paper styleName="auth-card row-flex">
        <div styleName="col auth-card-description-box" />
        <div styleName="col" style={{ marginTop: 5 }}>
          {signInFormSubmitting && <LinearProgress style={{ marginTop: -5 }} />}

          <div styleName="auth-card-content">
            <Typography variant="headline">{'Вход'}</Typography>
            <Typography variant="body1">{'Используйте аккаунт Гедымин'}</Typography>
            <div style={{ paddingTop: '10px' }}>
              <SignInFormContainer />
            </div>
          </div>
        </div>
      </Paper>
    );
  }

  private readonly renderSignInView = CSSModules(() => this.getSignInView(), styles, { allowMultiple: true });

  private getSignUpView() {
    const { signUpFormSubmitting, renderSignUpFormContainer: SignUpFormContainer } = this.props;

    return (
      <Paper styleName="auth-card row-flex">
        <div styleName="col auth-card-description-box" />
        <div styleName="col" style={{ marginTop: 5 }}>
          {signUpFormSubmitting && <LinearProgress style={{ marginTop: -5 }} />}

          <div styleName="auth-card-content">
            <Typography variant="headline">{'Регистрация'}</Typography>
            <Typography variant="body1">{'Создание аккаунта Гедымин'}</Typography>
            <div style={{ paddingTop: '10px' }}>
              <SignUpFormContainer />
            </div>
          </div>
        </div>
      </Paper>
    );
  }

  private readonly renderSignUpView = CSSModules(() => this.getSignUpView(), styles, { allowMultiple: true });

  public render(): JSX.Element {
    const { match } = this.props;
    return (
      <Fragment>
        <Paper>
          <Tabs
            value={location.pathname.indexOf(`${match.url}/signIn`) !== -1 ? 0 : 1 /* todo: tmp*/}
            indicatorColor="primary"
            textColor="primary"
            centered={true}
          >
            <Link to={`${match.url}/signIn`}>
              <Tab label="Вход" />
            </Link>
            <Link to={`${match.url}/signUp`}>
              <Tab label="Регистрация" />
            </Link>
          </Tabs>
        </Paper>
        <Switch>
          <Redirect exact={true} from={`${match.path}/`} to={`${match.path}/signIn`} />
          <Route path={`${match.path}/signIn`} component={this.renderSignInView} />
          <Route path={`${match.path}/signUp`} component={this.renderSignUpView} />
          <Redirect from={`${match.path}/*`} to={`${match.path}/`} />
        </Switch>
      </Fragment>
    );
  }
}

export { AuthView, IAuthViewProps, IAuthViewStateProps };
