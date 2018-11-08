import React, { PureComponent } from 'react';
import MuiTableRow, { TableRowProps as MuiTableRowProps } from '@material-ui/core/TableRow';
import { ITableRowProps as ICoreTableRowProps, TableRow as CoreTableRow } from '@gdmn/data-grid-core';

type TTableRowProps = ICoreTableRowProps & MuiTableRowProps;

class TableRow extends PureComponent<TTableRowProps, any> {
  public render(): JSX.Element {
    const { children, ...muiTableRowProps } = this.props; //  props.row

    return (
      <CoreTableRow renderComponent={MuiTableRow} {...muiTableRowProps}>
        {children}
      </CoreTableRow>
    );
  }
}

export { TableRow, TTableRowProps };
