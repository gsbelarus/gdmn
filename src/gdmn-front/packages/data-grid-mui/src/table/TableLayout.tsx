import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import { Paper } from '@material-ui/core';
import { IWithStyles } from '@gdmn/client-core';
import {
  ITableLayoutProps as ICoreTableLayoutProps,
  TableLayout as CoreTableLayout
} from '@gdmn/data-grid-core';

import { Table } from './Table';
import { TableBody } from './_/TableBody';
import { TableFoot } from './_/TableFoot';
import { TableHead } from './_/TableHead';
import { TableRow } from './_/TableRow';
import { TableCell } from './TableCell';

type TTableLayoutClassKey = 'stickyHeadCell' | 'stickyFootCell';
const styles: StyleRulesCallback<TTableLayoutClassKey> = theme => ({
  stickyHeadCell: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    overflow: 'visible',
    background: theme.palette.background.paper,
    fallbacks: {
      position: '-webkit-sticky'
    }
  },
  stickyFootCell: {
    position: 'sticky',
    bottom: 0,
    zIndex: 1,
    overflow: 'visible',
    background: theme.palette.background.paper,
    fallbacks: {
      position: '-webkit-sticky'
    }
  }
});

interface ITableLayoutProps extends ICoreTableLayoutProps {
  headSticky?: boolean;
  footSticky?: boolean;
}

// @withStyles(styles)
class TableLayout extends PureComponent<ITableLayoutProps & IWithStyles<TTableLayoutClassKey>, any> {
  public static defaultProps = {
    headSticky: true,
    footSticky: true,
    // CoreTableLayout:
    minColumnWidthPx: 120, // todo
    renderBody: TableBody,
    renderBodyCell: TableCell,
    renderColGroup: 'colgroup',
    renderColGroupCol: 'col',
    renderFoot: TableFoot,
    renderFootCell: TableCell,
    renderHead: TableHead,
    renderHeadCell: TableCell,
    renderRow: TableRow,
    renderScrollContainer: Paper,
    renderTable: Table,
    tableHeight: '60vh' // todo
  };

  public render(): JSX.Element {
    const { headSticky, footSticky, classes, ...coreTableLayoutProps } = this.props;

    // console.log('render TableLayout');

    return (
      <CoreTableLayout
        className={classNames({
          [classes!.stickyHeadCell]: headSticky,
          [classes!.stickyFootCell]: footSticky
        })}
        {...coreTableLayoutProps}
      />
    );
  }
}

// TODO minWidth
// TODO headCellStyle (headSticky)

export { TableLayout, ITableLayoutProps };

// NoDataCell = TableNoDataCell;
// NoDataRow = TableRow;
