import React from 'react';
import { Field, Form, InjectedFormProps } from 'redux-form';
import CSSModules from 'react-css-modules';
import { Button } from '@material-ui/core';
import { TextField, PasswordField, passwordValidator, requireValidator } from '@gdmn/client-core';

import { ISignInFormData } from '@src/app/scenes/auth/components/SignInForm';
import styles from './SignInForm.css';

interface ISignUpFormData extends ISignInFormData {
  email: string;
}

interface ISignUpFormProps extends InjectedFormProps<ISignUpFormData> {
  onSubmit: (values: Partial<ISignUpFormData>) => void;
}

@CSSModules(styles)
class SignUpForm extends React.Component<ISignUpFormProps> {
  public render(): JSX.Element {
    const { handleSubmit, onSubmit, pristine, submitting, initialized } = this.props;
    return (
      <Form onSubmit={handleSubmit((values: Partial<ISignUpFormData>) => onSubmit(values))}>
        <Field name="username" component={TextField as any} label="Пользователь" validate={requireValidator} />
        {/*<Field name="email" component={TextField as any} label="Email" validate={[requiredValidate, emailValidate]} />*/}
        <Field
          name="password"
          component={PasswordField as any}
          label="Пароль"
          type="password"
          validate={[requireValidator, passwordValidator]}
        />
        <div styleName="form-actions">
          <Button variant="raised" color="secondary" disabled={(!initialized && pristine) || submitting} type="submit">
            <span>Cоздать</span>
          </Button>
        </div>
      </Form>
    );
  }
}

export { SignUpForm, ISignUpFormProps, ISignUpFormData };
