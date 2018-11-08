import React, { PureComponent, ReactChild, ReactType } from 'react';

interface ITableHeadProps {
  children?: ReactChild | ReactChild[];
  renderComponent: ReactType;
}

class TableHead extends PureComponent<ITableHeadProps, any> {
  public render(): JSX.Element {
    const { renderComponent: Component, children, ...componentProps } = this.props;

    return <Component {...componentProps}>{children}</Component>;
  }
}

export { TableHead, ITableHeadProps };
