import React, { Component, Fragment } from 'react';
import { AutoSizer, List } from 'react-virtualized';

import { ITableColumn, TableLayout as CoreTableLayout } from './TableLayout';
import { IInfiniteTableLayoutProps, InfiniteTableLayout } from './InfiniteTableLayout';

type IInfiniteTableLayoutProps2 = IInfiniteTableLayoutProps & { heavyWeightRow?: boolean };

class InfiniteTableLayout2 extends Component<IInfiniteTableLayoutProps2, any> {
  public static defaultProps = {
    ...InfiniteTableLayout.defaultProps
  };

  constructor(props: IInfiniteTableLayoutProps2) {
    super(props);

    this.getMinWidth = this.getMinWidth.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
  }

  private getMinWidth(columns: ITableColumn[]): number {
    const { minColumnWidthPx } = this.props;

    return (
      columns
        .map(column => CoreTableLayout.getColumnWidthPx(column, minColumnWidthPx))
        .reduce((acc, width) => acc + width, 0) || 0
    );
  }

  private rowRenderer({ key, index, isScrolling, isVisible, style }: any) {
    const { renderRow: Row, renderBodyCell: BodyCell, rowHeightPx, bodyRows, columns, heavyWeightRow } = this.props;

    if (!(!!Row && !!BodyCell)) return <Fragment />;

    if (heavyWeightRow && !isVisible) return <Fragment />; // no overscan
    // if (isScrolling && !isVisible) return <Fragment />;

    return (
      <Row key={key} uid={bodyRows![index].id} style={style}>
        {columns!.map((column, i) => {
          const width = i === columns!.length - 1 ? '100%' : CoreTableLayout.getColumnWidthPx(column);
          return (
            <BodyCell
              key={column.id}
              column={column}
              rowData={bodyRows![index]}
              style={{
                width,
                minWidth: width,
                maxWidth: width,
                height: rowHeightPx
              }}
            />
          );
        })}
      </Row>
    );
  }

  public render(): JSX.Element {
    const {
      columns = [],
      headRows = [],
      bodyRows,
      // footRows,
      renderTable: Table,
      renderHead: Head,
      renderBody: Body,
      // renderFoot: Foot,
      renderRow: Row,
      renderHeadCell: HeadCell,
      renderBodyCell: BodyCell,
      // renderFootCell: FootCell,
      // renderColGroup: ColGroup,
      renderColGroupCol: Col,
      renderScrollContainer: ScrollContainer,
      tableHeight,
      //
      rowHeightPx,
      renderHeadTable: HeadTable,
      renderBodyTable: BodyTable
    } = this.props;

    // const BodyTable = 'div'; // TODO
    // console.log('render CoreTableLayout');

    const minWidth = this.getMinWidth(columns);

    // Math.min(height, rowHeight * bodyRows!.length)

    // console.log(columns);

    if (!(ScrollContainer && Table && Col && Row && Body && BodyCell && BodyTable)) return <Fragment />; // TODO

    return (
      <ScrollContainer style={{ overflow: 'auto' }}>
        {!!headRows.length && HeadTable && Head && HeadCell && (
          <HeadTable style={{ minWidth }}>
            {/*{ColGroup && (*/}
            {/*<ColGroup>*/}
            {/*{columns.map(column => <Col key={column.id} style={{ width: column.widthPx }} column={column} />)}*/}
            {/*</ColGroup>*/}
            {/*)}*/}
            <Head>
              {!!headRows &&
                headRows.map(row => (
                  <Row key={row.id}>
                    {HeadCell && columns.map(column => <HeadCell key={column.id} column={column} rowData={row} />)}
                  </Row>
                ))}
            </Head>
          </HeadTable>
        )}
        <BodyTable style={{ minWidth }}>
          {/*{ColGroup && (*/}
          {/*<ColGroup>*/}
          {/*{columns.map(column => (<Col key={column.id} style={{ width: column.widthPx }} column={column} />))}*/}
          {/*</ColGroup>*/}
          {/*)}*/}
          <Body>
            {/*<InfiniteLoader*/}
            {/*isRowLoaded={this.isRowLoaded}*/}
            {/*loadMoreRows={this.loadMoreRows}*/}
            {/*rowCount={bodyRowsTotal}*/}
            {/*ref={ref => this.infiniteLoader = ref}*/}
            {/*>*/}
            {/*{({ onRowsRendered, registerChild }) => (*/}
            <div style={{ height: tableHeight, width: '100%' }}>
              <AutoSizer>
                {({ width, height }) => (
                  // <div ref={registerChild as any}>
                  <List
                    // ref={this.setListComponent}
                    // autoHeight={true}
                    // autoWidth={true}
                    width={width}
                    height={height}
                    rowCount={bodyRows!.length}
                    rowHeight={
                      rowHeightPx!
                      // useDynamicRowHeight ? this.getRowHeight : rowHeight
                    }
                    // isScrolling={isScrolling}
                    // onScroll={onChildScroll}
                    // scrollTop={scrollTop}
                    // scrollToIndex={scrollToIndex}
                    rowRenderer={this.rowRenderer}
                    overscanRowCount={10}
                    // overscanColumnCount={0}
                    // onRowsRendered={onRowsRendered}
                  />
                  // </div>
                )}
              </AutoSizer>
            </div>
            {/*)}*/}
            {/*</InfiniteLoader>*/}
          </Body>
        </BodyTable>

        {/*{Foot && (*/}
        {/*<Foot>*/}
        {/*{!!footRows &&*/}
        {/*footRows.map(row => (*/}
        {/*<Row key={row.id}>*/}
        {/*{FootCell && columns.map(column => <FootCell key={column.id} column={column} rowData={row} />)}*/}
        {/*</Row>*/}
        {/*))}*/}
        {/*</Foot>*/}
        {/*)}*/}
      </ScrollContainer>
    );
  }
}

export { InfiniteTableLayout2, IInfiniteTableLayoutProps2 };
