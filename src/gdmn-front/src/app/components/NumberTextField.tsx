import * as React from 'react';
import { ITextFieldProps, TextField } from 'office-ui-fabric-react';

export interface INumberTextFieldProps extends ITextFieldProps {
  label: string;
  initialValue: string;
}

export interface INumberTextFieldState {
  value: string;
}

export class NumberTextField extends React.Component<INumberTextFieldProps, INumberTextFieldState> {
  constructor(props: INumberTextFieldProps) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.validateNumber = this.validateNumber.bind(this);

    this.state = {
      value: props.initialValue
    };
  }

  public render(): JSX.Element {
    return (
      <div className="NumberTextField">
        <TextField
          className="NumberTextField-textField"
          label={this.props.label}
          value={this.state.value}
          onChange={this.onChange}
          onGetErrorMessage={this.validateNumber}
        />
      </div>
    );
  }

  private validateNumber(value: string): string {
    return isNaN(Number(value)) ? `The value should be a number, actual is ${value}.` : '';
  }

  private onChange(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void {
    return this.setState({
      value: value || ''
    });
  }

}
