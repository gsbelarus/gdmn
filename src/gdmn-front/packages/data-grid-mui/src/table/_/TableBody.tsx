import React, { PureComponent } from 'react';
import MuiTableBody, { TableBodyProps as MuiTableBodyProps } from '@material-ui/core/TableBody';
import { ITableBodyProps as ICoreTableBodyProps, TableBody as CoreTableBody } from '@gdmn/data-grid-core';

type TTableBodyProps = ICoreTableBodyProps & MuiTableBodyProps;

class TableBody extends PureComponent<TTableBodyProps, any> {
  public render(): JSX.Element {
    const { children, ...muiTableBodyProps } = this.props;

    return (
      <CoreTableBody renderComponent={MuiTableBody} {...muiTableBodyProps}>
        {children}
      </CoreTableBody>
    );
  }
}

export { TableBody, TTableBodyProps };
