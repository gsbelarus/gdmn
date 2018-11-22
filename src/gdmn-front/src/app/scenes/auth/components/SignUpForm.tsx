import React from 'react';
import { Field, Form, InjectedFormProps } from 'redux-form';
import CSSModules from 'react-css-modules';
import { PrimaryButton } from "office-ui-fabric-react";
import { TextField, PasswordField, passwordValidator, requireValidator } from '@gdmn/client-core';
import { ISignInFormData } from '@src/app/scenes/auth/components/SignInForm';

import styles from './SignInForm.css';

export interface ISignUpFormData extends ISignInFormData {
  email: string;
};

export interface ISignUpFormProps extends InjectedFormProps<ISignUpFormData> {
  onSubmit: (values: Partial<ISignUpFormData>) => void;
};

@CSSModules(styles)
export class SignUpForm extends React.Component<ISignUpFormProps> {
  public render(): JSX.Element {
    const { handleSubmit, onSubmit, pristine, submitting, initialized } = this.props;
    return (
      <Form onSubmit={handleSubmit((values: Partial<ISignUpFormData>) => onSubmit(values))}>
        <Field name="username" component={TextField as any} label="Пользователь" validate={requireValidator} />
        <Field
          name="password"
          component={PasswordField as any}
          label="Пароль"
          type="password"
          validate={[requireValidator, passwordValidator]}
        />
        <div styleName="form-actions">
          <PrimaryButton
            disabled={(!initialized && pristine) || submitting}
            text="Создать"
            type="submit"
          />
        </div>
      </Form>
    );
  }
};
