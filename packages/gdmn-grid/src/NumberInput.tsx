import React from 'react';

interface IProps {
  value: number;
  label: string;
  size: number;
  pattern: string;
  name: string;
  onChange: (newValue: number) => void;
}

export class NumberInput extends React.PureComponent<IProps> {
  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value);
    if (!isNaN(parsed)) {
      this.props.onChange(parsed);
    } else {
      this.props.onChange(0);
    }
  };

  public render() {
    const { label, pattern, value, size, name } = this.props;

    return (
      <span>
        <label htmlFor={name}>{label}</label>
        <input type="number" pattern={pattern} onChange={this.handleChange} value={value} size={size} name={name} />
      </span>
    );
  }
}
