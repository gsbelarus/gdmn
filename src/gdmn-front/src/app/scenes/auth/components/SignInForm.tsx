import React from 'react';
import { Field, Form, InjectedFormProps } from 'redux-form';
import CSSModules from 'react-css-modules';
import { TextField, requireValidator, PasswordField } from '@gdmn/client-core';
import { PrimaryButton } from "office-ui-fabric-react";

import styles from './SignInForm.css';

export interface ISignInFormProps extends InjectedFormProps<ISignInFormData> {
  onSubmit: (values: Partial<ISignInFormData>) => void;
};

export interface ISignInFormData {
  username: string;
  password: string;
};

@CSSModules(styles)
export class SignInForm extends React.Component<ISignInFormProps> {
  public render(): JSX.Element {
    const { handleSubmit, onSubmit, pristine, submitting, initialized } = this.props;
    return (
      <Form onSubmit={handleSubmit((values: Partial<ISignInFormData>) => onSubmit(values))}>
        <Field
          name="username"
          component={TextField as any}
          label="Пользователь"
          validate={requireValidator}
        />
        <Field
          name="password"
          component={PasswordField as any}
          label="Пароль"
          type="password"
          validate={requireValidator}
        />
        <div styleName="form-actions">
          <PrimaryButton
            disabled={(!initialized && pristine) || submitting}
            type="submit"
            text="Войти"
          />
        </div>
      </Form>
    );
  }
};