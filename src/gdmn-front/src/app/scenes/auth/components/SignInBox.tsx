import React, { Component, Fragment } from 'react';
import { TextField,  } from 'office-ui-fabric-react/lib/components/TextField';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { PasswordInput } from '@gdmn/client-core';

//  пока добавлено в global.css
//import '/src/styles/SignInBox.css';

export interface ISignInBoxData {
  userName: string;
  password: string;
}

export interface ISignInBoxStateProps {
  signInInitialValues: ISignInBoxData;
  signInRequesting: boolean;
}

export interface ISignInBoxProps extends ISignInBoxStateProps {
  onSignIn: (data: ISignInBoxData) => void;
}

interface ISignInBoxState {
  activeTab: string;
  userName: string;
  password: string;
}

export class SignInBox extends Component<ISignInBoxProps, ISignInBoxState> {
  state: ISignInBoxState = {
    ...this.props.signInInitialValues,
    activeTab: 'Вход'
  };

  render() {
    const { onSignIn, signInRequesting } = this.props;
    const { userName, password, activeTab } = this.state;
    const tabs = ['Вход', 'Регистрация'];

    return (
      <div className="SignInBackground">
        <div className="SignInForm">
          <div className="SignInFormTabs">
            {tabs.map(t =>
              t === activeTab ? (
                <Fragment key={t}>
                  <div className="SignInFormTab" onClick={() => signInRequesting || this.setState({ activeTab: t })}>
                    <div className="SignInFormActiveColor" />
                    <div className="SignInFormTabText SignInFormActiveTab">{t}</div>
                  </div>
                  <div className="SignInFormTabSpace" />
                </Fragment>
              ) : (
                <Fragment key={t}>
                  <div className="SignInFormTab" onClick={() => signInRequesting || this.setState({ activeTab: t })}>
                    <div className="SignInFormTabText SignInFormInactiveTab">{t}</div>
                    <div className="SignInFormInactiveShadow" />
                  </div>
                  <div className="SignInFormTabSpace" />
                </Fragment>
              )
            )}
            <div className="SignInFormRestSpace" />
          </div>
          <div className="SignInFormBody">
            {activeTab === 'Вход' ? (
              <>
                <TextField
                  label="Пользователь:"
                  disabled={signInRequesting}
                  value={userName}
                  onBeforeChange={userName => this.setState({ userName })}
                />
                <PasswordInput
                  label="Пароль:"
                  disabled={signInRequesting}
                  value={password}
                  onBeforeChange={password => this.setState({ password })}
                />
                <div className="SignInText">Забыли пароль?</div>
                <div className="SignInButtons">
                  <PrimaryButton
                    text="Войти"
                    disabled={signInRequesting}
                    onRenderIcon={
                      signInRequesting ? (_props, _defaultRenderer) => <Spinner size={SpinnerSize.xSmall} /> : undefined
                    }
                    onClick={() => {
                      onSignIn({ userName, password });
                    }}
                  />
                </div>
              </>
            ) : (
              <div>Скоро будет...</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
