import React from 'react';
import { ITextFieldProps, TextField, Icon } from 'office-ui-fabric-react';

interface IPasswordInputState {
  passwVisible?: boolean;
}

export class PasswordInput extends React.Component<ITextFieldProps, IPasswordInputState> {
  public state: IPasswordInputState = {
    passwVisible: this.props.defaultChecked
  };

  public render(): JSX.Element {
    const { passwVisible } = this.state;
    return (
      <TextField
        {...this.props}
        type={passwVisible ? 'text' : 'password'}
        onRenderSuffix={() => (
          <Icon
            iconName="RedEye"
            onClick={() => {
              this.setState({ passwVisible: true });
              setTimeout(() => this.setState({ passwVisible: false }), 400);
            }}
          />
        )}
      />
    );
  }
}
