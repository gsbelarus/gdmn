import React, { Component } from 'react';

interface ITextFieldProps {
  style?: object;
  data: object | string;
  getValue: (data: object | string) => string;
}

class TextField extends Component<ITextFieldProps, any> {
  // TODO pure

  public static defaultProps = {
    getValue: (data: object | string) => (typeof data === 'object' ? JSON.stringify(data) : data)
  };

  public render(): JSX.Element {
    const { getValue, data, style } = this.props;

    return (
      // TODO Typography
      <span style={style}>{getValue(data)}</span>
    );
  } // todo React.Fragment
}

export { TextField, ITextFieldProps };
