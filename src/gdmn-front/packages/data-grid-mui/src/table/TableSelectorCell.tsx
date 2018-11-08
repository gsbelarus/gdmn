import React, { PureComponent } from 'react';
import classNames from 'classnames';
import MuiTableCell, { TableCellProps as MuiTableCellProps } from '@material-ui/core/TableCell';
import Checkbox from '@material-ui/core/Checkbox';
import { StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import { IWithStyles, withStyles } from '@gdmn/client-core';

type TTableCellClassKey = 'cell' | 'pointer';
const styles: StyleRulesCallback<TTableCellClassKey> = theme => ({
  cell: {
    overflow: 'visible',
    padding: 0,
    textAlign: 'center',

    width: 48
  },
  pointer: {
    // cursor: 'pointer'
  }
});

type TBaseTableCellProps = MuiTableCellProps & IWithStyles<TTableCellClassKey>;
interface ITableSelectorCellProps extends TBaseTableCellProps {
  selectorDisabled: boolean;
  selectorChecked: boolean;
  onSelectorToggle: () => void;

  className?: string;
  // TODO someSelected, allSelected
}

@withStyles(styles)
class TableSelectorCell extends PureComponent<ITableSelectorCellProps, any> {
  public static defaultProps = {
    selectorDisabled: false,
    selectorChecked: false
  };

  public render(): JSX.Element {
    const { selectorDisabled, selectorChecked, onSelectorToggle, className, classes, ...muiCellProps } = this.props;

    const cellClasses = classNames(
      {
        [classes!.cell]: true,
        [classes!.pointer]: !selectorDisabled
      },
      className
    );

    return (
      <MuiTableCell padding="checkbox" className={cellClasses} {...muiCellProps}>
        <Checkbox
          checked={selectorChecked}
          disabled={selectorDisabled}
          onClick={e => {
            if (selectorDisabled) return;
            // e.stopPropagation();
            onSelectorToggle();
          }}
        />
      </MuiTableCell>
    );
  }
}

export { TableSelectorCell, ITableSelectorCellProps };
