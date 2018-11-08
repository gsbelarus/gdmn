import React, { PureComponent, ReactChild, ReactType } from 'react';

import { IInjectedSelectionProps } from './withSelection';

interface ITableCellProps extends IInjectedSelectionProps {
  children?: ReactChild | ReactChild[];
  loading?: boolean; // content = fixed-height skeleton
  renderComponent?: ReactType; // 'td' // TODO func({key, rowData, column})
  renderContent: ReactType;
  renderContentSkeleton?: ReactType;
  [t: string]: any;
  // ...componentProps:
  // tabIndex: number, // browser-focusable
  // onDoubleClick: ()=>void
}

class TableCell extends PureComponent<ITableCellProps, any> {
  public static defaultProps = {
    loading: false
  };

  public render(): JSX.Element {
    const {
      renderComponent,
      renderContent: Content,
      renderContentSkeleton: Skeleton,
      loading,
      ...componentProps
    } = this.props;

    const Component = renderComponent!;

    return <Component {...componentProps}>{loading && Skeleton ? <Skeleton /> : <Content />}</Component>;
  }
}

export { TableCell, ITableCellProps };
