import React from 'react';

interface IProps {
  value: string;
  label: string;
  size: number;
  pattern: string;
  name: string;
  onChange: (newValue: string) => void;
}

export class StringInput extends React.PureComponent<IProps> {

  private handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.onChange(e.target.value);
  }

  public render() {
    return (
      <span>
        <label htmlFor={this.props.name}>
          {this.props.label}
        </label>
        <input
          type="text"
          pattern={this.props.pattern}           
          onInput={this.handleChange.bind(this)}
          defaultValue={this.props.value.toString()}
          size={this.props.size}
          name={this.props.name}          
        />
      </span>
    )
  }
}