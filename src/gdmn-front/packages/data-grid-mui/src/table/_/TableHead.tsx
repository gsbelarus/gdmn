import React, { PureComponent } from 'react';
import MuiTableHead, { TableHeadProps as MuiTableHeadProps } from '@material-ui/core/TableHead';
import { ITableHeadProps as ICoreTableHeadProps, TableHead as CoreTableHead } from '@gdmn/data-grid-core';

type TTableHeadProps = ICoreTableHeadProps & MuiTableHeadProps;

class TableHead extends PureComponent<TTableHeadProps, any> {
  public render(): JSX.Element {
    const { children, ...muiTableHeadProps } = this.props;

    return (
      <CoreTableHead renderComponent={MuiTableHead} {...muiTableHeadProps}>
        {children}
      </CoreTableHead>
    );
  }
}

export { TableHead, TTableHeadProps };
