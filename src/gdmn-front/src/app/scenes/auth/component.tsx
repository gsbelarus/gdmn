import React, { ReactType, Fragment } from 'react';
import CSSModules from 'react-css-modules';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { ProgressIndicator, Label, CommandBar, ICommandBarItemProps, IComponentAsProps } from 'office-ui-fabric-react';
import styles from './styles.css';
import { LinkCommandBarButton } from '@gdmn/client-core';

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
      <div styleName="auth-card row-flex">
        <div styleName="col auth-card-description-box" />
        <div styleName="col" style={{ marginTop: 5 }}>
          {signInFormSubmitting && <ProgressIndicator />}

          <div styleName="auth-card-content">
            <Label>{'Вход'}</Label>
            <Label>{'Используйте аккаунт Гедымин'}</Label>
            <div style={{ paddingTop: '10px' }}>
              <SignInFormContainer />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private readonly renderSignInView = CSSModules(() => this.getSignInView(), styles, { allowMultiple: true });

  private getSignUpView() {
    const { signUpFormSubmitting, renderSignUpFormContainer: SignUpFormContainer } = this.props;

    return (
      <div styleName="auth-card row-flex">
        <div styleName="col auth-card-description-box" />
        <div styleName="col" style={{ marginTop: 5 }}>
          {signUpFormSubmitting && <ProgressIndicator />}

          <div styleName="auth-card-content">
            <Label>{'Регистрация'}</Label>
            <Label>{'Создание аккаунта Гедымин'}</Label>
            <div style={{ paddingTop: '10px' }}>
              <SignUpFormContainer />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private readonly renderSignUpView = CSSModules(() => this.getSignUpView(), styles, { allowMultiple: true });

  public render(): JSX.Element {
    const { match } = this.props;
    // value={location.pathname.indexOf(`${match.url}/signIn`) !== -1 ? 0 : 1 /* todo: tmp*/}
    return (
      <Fragment>
        <div>
          <CommandBar
            items={this.getItems()}
          />
        </div>
        <Switch>
          <Redirect exact={true} from={`${match.path}/`} to={`${match.path}/signIn`} />
          <Route path={`${match.path}/signIn`} component={this.renderSignInView} />
          <Route path={`${match.path}/signUp`} component={this.renderSignUpView} />
          <Redirect from={`${match.path}/*`} to={`${match.path}/`} />
        </Switch>
      </Fragment>
    );
  }

  private getItems = (): ICommandBarItemProps[] => {
    const { match } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };

    return [
      {
        key: 'signIn',
        text: 'Вход',
        commandBarButtonAs: btn(`${match.url}/signIn`)
      },
      {
        key: 'signUp',
        text: 'Регистрация',
        commandBarButtonAs: btn(`${match.url}/signUp`)
      }
    ];
  }
}

export { AuthView, IAuthViewProps, IAuthViewStateProps };
