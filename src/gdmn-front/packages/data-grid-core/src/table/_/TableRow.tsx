import React, { Fragment, PureComponent, ReactChild, ReactType } from 'react';

import { IInjectedSelectorSelectionProps } from '../withSelectorSelection';

interface ITableRowProps extends IInjectedSelectorSelectionProps {
  children?: ReactChild | ReactChild[];
  renderComponent?: ReactType;
  [t: string]: any;
}

class TableRow extends PureComponent<ITableRowProps, any> {
  public render(): JSX.Element {
    const { renderComponent: Component, children, ...componentProps } = this.props;

    if (!Component) return <Fragment />; // FIXME

    return <Component {...componentProps}>{children}</Component>;
  }
}

export { TableRow, ITableRowProps };
