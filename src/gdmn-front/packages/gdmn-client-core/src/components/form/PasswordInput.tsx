import React from 'react';
import { IconButton, TextField, InputAdornment } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField/TextField';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import CSSModules from 'react-css-modules';

// @ts-ignore // fixme
const styles = require('./PasswordInput.css');

interface IPasswordInputProps extends TextFieldProps {
  defaultChecked?: boolean;
  disableButton?: boolean;
  // TODO remove multiline, type
}

interface IPasswordInputState {
  checked?: boolean;
}

@CSSModules(styles, { allowMultiple: true })
class PasswordInput extends React.Component<IPasswordInputProps, IPasswordInputState> {
  public static defaultProps: IPasswordInputProps = {
    defaultChecked: false,
    disableButton: false
  };

  public state: IPasswordInputState = {
    checked: true
  };

  constructor(props: IPasswordInputProps) {
    super(props);

    this.state = {
      checked: props.defaultChecked
    };

    this.toggle = this.toggle.bind(this);
  }

  private toggle() {
    this.setState({
      checked: !this.state.checked
    });
  }

  private static handleMouseDown(event: any) {
    event.preventDefault();
  }

  public render(): JSX.Element {
    const { disableButton, defaultChecked, multiline, type, ...passwordTextFieldProps } = this.props; // exclude do not remove unused!
    const { checked } = this.state;

    // const iconClass = 'input-button-icon' + (passwordTextFieldProps.disabled ? ' unchecked' : '');

    return (
      <div styleName={'root ' + (passwordTextFieldProps.fullWidth ? ' full-width' : '')}>
        <TextField
          {...passwordTextFieldProps}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  onClick={this.toggle}
                  onMouseDown={PasswordInput.handleMouseDown}
                  disabled={disableButton || passwordTextFieldProps.disabled}
                  // tabIndex="-1"
                >
                  {checked ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
          type={checked ? 'text' : 'password'}
        />
      </div>
    );
  }
}

export { PasswordInput, IPasswordInputProps };
