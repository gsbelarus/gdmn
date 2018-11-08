import React, { PureComponent } from 'react';
import MuiTableFoot, { TableFooterProps as MuiTableFootProps } from '@material-ui/core/TableFooter';
import { ITableFootProps as ICoreTableFootProps, TableFoot as CoreTableFoot } from '@gdmn/data-grid-core';

type TTableFootProps = ICoreTableFootProps & MuiTableFootProps;

class TableFoot extends PureComponent<TTableFootProps, any> {
  public render(): JSX.Element {
    const { children, ...muiTableFootProps } = this.props;

    return (
      <CoreTableFoot renderComponent={MuiTableFoot} {...muiTableFootProps}>
        {children}
      </CoreTableFoot>
    );
  }
}

export { TableFoot, TTableFootProps };
