import React, { ComponentType } from 'react';
import { compose, defaultProps, setDisplayName, setStatic, withProps, wrapDisplayName } from 'recompose';
import { ITableLayoutProps, withSelectorSelection } from '@gdmn/data-grid-core';

import { TableRow, TTableRowProps } from './_/TableRow';
import { TableSelectorCell } from './TableSelectorCell';

// TODO props types
// TODO state

// todo on onClick select, onDrag select
// todo selectionMode: ['row', 'miltipleCells', 'singleCell']
// todo selectableByRowClick

// FIXME

function withLayoutSelection<P extends ITableLayoutProps>(LayoutComponent: ComponentType<P>) {
  const enhanced = compose<P, P>(
    setDisplayName(
      wrapDisplayName(
        // @ts-ignore // fixme
        LayoutComponent,
        'withLayoutSelection'
      )
    ),
    setStatic('WrappedComponent', LayoutComponent),
    defaultProps({
      // TODO -> static
      // renderBodyCell: withSelection<ITableCellProps>(TableCell),
      renderRow: compose(
        withProps({ renderSelectorCell: TableSelectorCell, role: 'checkbox', hover: true, tabIndex: -1 })
      )(withSelectorSelection<TTableRowProps>(TableRow))
    })
  )(LayoutComponent);

  return enhanced; // hoistStatics(enhanced as any)(LayoutComponent);
}

export { withLayoutSelection };
