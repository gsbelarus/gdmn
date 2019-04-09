import React, { Component, Fragment } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/components/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { PasswordInput } from '@gdmn/client-core';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react';
import { getId } from 'office-ui-fabric-react/lib/Utilities';

//  пока добавлено в global.css
//import '/src/styles/SignInBox.css';

export interface ISignInBoxData {
  userName: string;
  password: string;
}

export interface ISignInBoxStateProps {
  signInInitialValues: ISignInBoxData;
  signInRequesting: boolean;
  signUpRequesting: boolean;
  errorMessage?: string[];
}

export interface ISignInBoxProps extends ISignInBoxStateProps {
  onSignIn: (data: ISignInBoxData) => void;
  onSignUp: (data: ISignInBoxData) => void;
  onHideMessage: () => void;
}

interface ISignInBoxState {
  activeTab: string;
  userName: string;
  password: string;
  repeatPassword: string;
  hideDialog: boolean;
}

export class SignInBox extends Component<ISignInBoxProps, ISignInBoxState> {
  state: ISignInBoxState = {
    ...this.props.signInInitialValues,
    activeTab: 'Вход',
    repeatPassword: '',
    hideDialog: this.props.errorMessage && this.props.errorMessage.length ? true : false,
  };

  render() {
    const { onSignIn, signInRequesting, onSignUp, signUpRequesting, errorMessage, onHideMessage } = this.props;
    const { userName, password, repeatPassword, activeTab } = this.state;
    const tabs = ['Вход', 'Регистрация'];


    return (
      <div className="SignInBox">
        <Dialog
          hidden={ this.props.errorMessage && this.props.errorMessage.length > 0 ? false : true }
          onDismiss={() => onHideMessage()}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'ERROR',
            subText: errorMessage ? errorMessage.reduce( (text, message) => {return text + message ? message : "Undefined error!" + '\r\n'}, '') : "Undefined error!"
          }}
          modalProps={{
            titleAriaId: getId('dialogLabel'),
            subtitleAriaId: getId('subTextLabel'),
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride'
          }}
        >
          <DialogFooter>
            <DefaultButton onClick={() => { onHideMessage() }} text="Cancel" />
          </DialogFooter>
        </Dialog>
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
                    onBeforeChange={ userName => userName && this.setState({ userName }) }
                  />
                  <PasswordInput
                    label="Пароль:"
                    disabled={signInRequesting}
                    value={password}
                    onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                      this.setState({ password: newValue ? newValue : '' });
                    }}
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
                  <>
                    <TextField
                      label="Пользователь:"
                      disabled={signUpRequesting}
                      value={userName}
                      onBeforeChange={ userName => userName && this.setState({ userName }) }
                    />
                    <PasswordInput
                      label="Пароль:"
                      disabled={signUpRequesting}
                      value={password}
                      onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                        this.setState({ password: newValue ? newValue : '' });
                        if (repeatPassword !== '') this.setState({ repeatPassword: '' });
                      }}
                    />
                    <PasswordInput
                      label="Повторите пароль:"
                      disabled={signUpRequesting}
                      value={repeatPassword}
                      onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                        this.setState({ repeatPassword: newValue ? newValue : '' });
                      }}
                      onGetErrorMessage={(value) => value === '' ? "Повторите пароль" : value === password ? "" : "Неправильный пароль"}
                    />
                    <div className="SignUpButtons">
                      <PrimaryButton
                        text="Регистрация"
                        disabled={signUpRequesting || userName === '' || password === '' || repeatPassword === '' || password !== repeatPassword}
                        onRenderIcon={
                          signUpRequesting ? (_props, _defaultRenderer) => <Spinner size={SpinnerSize.xSmall} /> : undefined
                        }
                        onClick={() => {
                          onSignUp({ userName, password });
                        }}
                      />
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
