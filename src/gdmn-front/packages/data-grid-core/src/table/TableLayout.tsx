import React, { Fragment, Key, PureComponent, ReactType } from 'react';

interface ITableRow {
  id: Key;
  heightPx?: number; // TODO
  [t: string]: any;
}

interface ITableColumn {
  id: Key;
  widthPx?: number;
  align?: string;
  [t: string]: any;
}

interface ITableLayoutProps {
  bodyRows?: ITableRow[];
  columns?: ITableColumn[];
  footRows?: ITableRow[];
  headRows?: ITableRow[];
  tableHeightPx: number; // todo maxTableHeight
  tableHeight?: string;
  minColumnWidthPx?: number;
  renderBody?: ReactType;
  renderBodyCell?: ReactType;
  renderColGroup?: ReactType; // 'colgroup',
  renderColGroupCol?: ReactType; // 'col'
  renderScrollContainer?: ReactType;
  renderFoot?: ReactType;
  renderFootCell?: ReactType;
  renderHead?: ReactType;
  renderHeadCell?: ReactType;
  renderRow?: ReactType;
  renderTable?: ReactType;
  [t: string]: any;
}

// TODO arrow -> renderItem
// TODO col, cell types

class TableLayout extends PureComponent<ITableLayoutProps, any> {
  public static defaultProps = {
    columns: [],
    bodyRows: [],
    footRows: [],
    headRows: []
  };

  constructor(props: ITableLayoutProps) {
    super(props);

    this.getMinWidth = this.getMinWidth.bind(this);
  }

  public static getColumnWidthPx(column: ITableColumn, minColumnWidthPx?: number): number {
    return column.widthPx || minColumnWidthPx || 0;
  }

  private getMinWidth(columns: ITableColumn[]): number {
    const { minColumnWidthPx } = this.props;

    return (
      columns
        .map(column => TableLayout.getColumnWidthPx(column, minColumnWidthPx))
        .reduce((acc, width) => acc + width, 0) || 0
    );
  }

  public render(): JSX.Element {
    const {
      columns = [],
      headRows,
      bodyRows,
      footRows,
      renderTable: Table,
      renderHead: Head,
      renderBody: Body,
      renderFoot: Foot,
      renderRow: Row,
      renderHeadCell: HeadCell,
      renderBodyCell: BodyCell,
      renderFootCell: FootCell,
      renderColGroup: ColGroup,
      renderColGroupCol: Col,
      renderScrollContainer: ScrollContainer,
      tableHeightPx,
      tableHeight
    } = this.props;

    // console.log('render CoreTableLayout');

    const minWidth = this.getMinWidth(columns);

    if (!(ScrollContainer && Table && Col && Row && Body && BodyCell)) return <Fragment />; // TODO

    return (
      <ScrollContainer style={{ maxHeight: tableHeight || tableHeightPx, overflow: 'auto' }}>
        <Table style={{ minWidth: `${minWidth}px` }}>
          {ColGroup && (
            <ColGroup>
              {columns.map(column => (
                <Col key={column.id} style={{ width: column.widthPx }} column={column} />
              ))}
            </ColGroup>
          )}
          {Head && (
            <Head>
              {!!headRows &&
                headRows.map(row => (
                  <Row key={row.id}>
                    {HeadCell && columns.map(column => <HeadCell key={column.id} column={column} rowData={row} />)}
                  </Row>
                ))}
            </Head>
          )}
          <Body>
            {!!bodyRows &&
              bodyRows.map(row => (
                <Row key={row.id} uid={row.id}>
                  {columns.map(column => (
                    <BodyCell key={column.id} column={column} rowData={row} />
                  ))}
                </Row>
              ))}
          </Body>
          {Foot && (
            <Foot>
              {!!footRows &&
                footRows.map(row => (
                  <Row key={row.id}>
                    {FootCell && columns.map(column => <FootCell key={column.id} column={column} rowData={row} />)}
                  </Row>
                ))}
            </Foot>
          )}
        </Table>
      </ScrollContainer>
    );
  }
}

export { TableLayout, ITableLayoutProps, ITableColumn, ITableRow };
