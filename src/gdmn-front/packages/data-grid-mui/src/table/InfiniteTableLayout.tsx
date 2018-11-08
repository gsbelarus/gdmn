import React, { Component } from 'react';
import {
  IInfiniteTableLayoutProps2 as ICoreInfiniteTableLayoutProps,
  InfiniteTableLayout2 as CoreInfiniteTableLayout
} from '@gdmn/data-grid-core';

import { TableLayout } from './TableLayout';
import { Table } from './Table';

type TInfiniteTableLayoutProps = ICoreInfiniteTableLayoutProps;

class InfiniteTableLayout extends Component<TInfiniteTableLayoutProps, any> {
  public static defaultProps = {
    ...TableLayout.defaultProps,
    // CoreInfiniteTableLayout:
    rowHeightPx: 48,
    tableHeightPx: 530,
    renderBodyTable: Table,
    renderHeadTable: Table // todo stiky
  };

  public render(): JSX.Element {
    const { ...coreInfiniteTableLayoutProps } = this.props;

    return <CoreInfiniteTableLayout {...coreInfiniteTableLayoutProps} />;
  }
}

export { InfiniteTableLayout, TInfiniteTableLayoutProps };

// StubRow = TableStubRow;
// StubCell = TableStubCell;
// StubHeaderCell = TableStubCell;
