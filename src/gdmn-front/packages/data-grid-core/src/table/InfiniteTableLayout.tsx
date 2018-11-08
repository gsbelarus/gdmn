import React, { Fragment, Key, PureComponent, ReactType } from 'react';
import { findDOMNode } from 'react-dom';
import {RefWrapper, SizeMeasurer} from "@gdmn/client-core";

import { ITableColumn, ITableLayoutProps, ITableRow, TableLayout } from './TableLayout';

interface IInfiniteTableLayoutProps extends ITableLayoutProps {
  tableMinWidthPx: number; // TODO calc from column?
  rowHeightPx?: number;
  renderBodyTable?: ReactType;
  renderHeadTable?: ReactType;
  // TODO (delete) renderTable, tableHeight
}

interface IInfiniteTableLayoutState {
  rowHeights: Map<Key, number>;
  viewportTop: number;
  viewportLeft: number;
}

class InfiniteTableLayout extends PureComponent<IInfiniteTableLayoutProps, IInfiniteTableLayoutState> {
  public static defaultProps = {
    ...TableLayout.defaultProps
  };

  public state: IInfiniteTableLayoutState = {
    rowHeights: new Map<Key, number>(),
    viewportTop: 0,
    viewportLeft: 0
  };

  private rowRefs = new Map<ITableRow, HTMLElement>();

  constructor(props: IInfiniteTableLayoutProps) {
    super(props);

    this.updateRowHeightsState = this.updateRowHeightsState.bind(this);
    this.getDiffRectHeightRows = this.getDiffRectHeightRows.bind(this);
    this.getRowHeightPx = this.getRowHeightPx.bind(this);
    this.setRowRef = this.setRowRef.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.filterVisible = this.filterVisible.bind(this);
  }

  public componentDidMount() {
    this.updateRowHeightsState();
  }

  public componentWillReceiveProps(nextProps: IInfiniteTableLayoutProps) {
    const { headerRows, bodyRows } = this.props;
    const { rowHeights } = this.state;

    // if (!(headerRows !== nextProps.headerRows || bodyRows !== nextProps.bodyRows)) return;
    //
    // const nextRowHeights = [...(nextProps.headerRows || []), ...(nextProps.bodyRows || [])].reduce((acc, row) => {
    //   const rowHeight = rowHeights.get(row.id);
    //   if (!!rowHeight) acc.set(row.id, rowHeight);
    //   return acc;
    // }, new Map());
    //
    // this.setState({ rowHeights: nextRowHeights });
  }

  public componentDidUpdate() {
    this.updateRowHeightsState();
  }

  private updateRowHeightsState() {
    const diffRows = this.getDiffRectHeightRows(); // rows with changed heights
    if (!diffRows.length) return;

    const { rowHeights } = this.state;

    diffRows.forEach(([row, height]) => rowHeights.set(row.id, height));

    this.setState({ rowHeights });
  }

  private getDiffRectHeightRows(): any[] {
    return Array.from(this.rowRefs.entries())
      .map(([row, ref]) => [row, findDOMNode(ref)]) // TODO
      .filter(([row, node]) => !!node)
      .map(([row, node]) => [row, (node as Element).getBoundingClientRect().height]) // todo test || node.offsetHeight
      .filter(([row, height]) => height !== this.getRowHeightPx(row as ITableRow)); // todo
  }

  private getRowHeightPx(row: ITableRow): number {
    const { rowHeightPx } = this.props;
    const { rowHeights } = this.state;

    return rowHeights.get(row.id) || row.heightPx || rowHeightPx || 0;
  }

  private setRowRef(row: ITableRow, ref: HTMLElement) {
    if (ref === null) {
      this.rowRefs.delete(row);
    } else {
      this.rowRefs.set(row, ref);
    }
  }

  private handleScroll(event: UIEvent) {
    if (event.target !== event.currentTarget) return;
    // todo test flicker

    const node = event.target; // TODO test event.srcElement
    const { viewportTop } = this.state;

    if (viewportTop === (node as Element).scrollTop) return;

    this.setState({
      viewportTop: (node as Element).scrollTop,
      viewportLeft: (node as Element).scrollLeft
    });
  }

  private filterVisible(
    rows: ITableRow[],
    columns: ITableColumn[],
    { top, height, left, width }: { top: number; height: number; left: number; width: number }
  ): { rows: ITableRow[]; columns: ITableColumn[] } {
    if (!rows.length || !columns.length) {
      return {
        columns: [],
        rows: []
      };
    }

    const { minColumnWidthPx } = this.props;
    const getColumnWidthPx: (column: ITableColumn) => number = column =>
      TableLayout.getColumnWidthPx(column, minColumnWidthPx);

    const rowsVisibleBoundary = InfiniteTableLayout.getVisibleBoundary(rows, top, height, this.getRowHeightPx, 1); // todo overscan count
    const columnsVisibleBoundary = InfiniteTableLayout.getVisibleBoundary(columns, left, width, getColumnWidthPx, 1);

    const columnBoundaries = InfiniteTableLayout.getItemBoundaries(columns.length, columnsVisibleBoundary);
    const rowBoundaries = InfiniteTableLayout.getItemBoundaries(rows.length, rowsVisibleBoundary);

    const visibleStubCells = InfiniteTableLayout.getVisibleStubCells(columnBoundaries);

    return {
      columns: InfiniteTableLayout.getVisibleItems(
        columns,
        columnsVisibleBoundary,
        columnBoundaries,
        getColumnWidthPx,
        (column: ITableColumn) => column,
        (boundary: { start: number; end: number }, widthPx: number) => ({
          id: `${boundary.start}_${boundary.end}_stub`,
          widthPx
        })
      ) as ITableColumn[], // TODO return type <>
      rows: InfiniteTableLayout.getVisibleItems(
        rows,
        rowsVisibleBoundary,
        rowBoundaries,
        this.getRowHeightPx,
        (row: ITableRow) => ({
          row,
          cells: visibleStubCells // TODO ?
        }),
        (boundary: { start: number; end: number }, heightPx: number) => ({
          row: { id: `${boundary.start}_${boundary.end}_stub`, heightPx }
        })
      ) as ITableRow[]
    };
  }

  public render(): JSX.Element {
    const {
      columns = [],
      headRows = [],
      bodyRows = [],
      // todo footRows,
      tableHeightPx,
      renderHead: Head,
      renderBody: Body,
      // todo renderFoot: Foot,
      renderRow: Row,
      renderHeadCell: HeadCell,
      renderBodyCell: BodyCell,
      // todo renderFootCell: FootCell,
      renderColGroup: ColGroup,
      renderColGroupCol: Col,
      renderScrollContainer: ScrollContainer,
      //
      tableMinWidthPx,
      renderHeadTable: HeadTable,
      renderBodyTable: BodyTable
    } = this.props;
    const { viewportLeft, viewportTop } = this.state;

    if (!BodyTable) return <Fragment />; // FIXME

    return (
      <SizeMeasurer>
        {({ width }) => {
          // todo tableMinWidth = calc from columns

          const headHeight = headRows.length ? headRows.reduce((acc, row) => acc + this.getRowHeightPx(row), 0) : 0;

          // const { columns: visibleHeadColumns, rows: visibleHeadRows } = this.filterVisible(headRows, columns, {
          //   top: 0,
          //   left: viewportLeft,
          //   height: headHeight,
          //   width
          // });
          //
          const { columns: visibleBodyColumns2, rows: visibleBodyRows2 } = this.filterVisible(bodyRows, columns, {
            top: viewportTop,
            left: viewportLeft,
            height: tableHeightPx - headHeight,
            width
          });

          const visibleHeadRows = headRows;
          const visibleHeadColumns = columns; // TODO tmp
          const visibleBodyColumns = columns;
          const visibleBodyRows = visibleBodyRows2; // TODO tmp

          console.log(visibleBodyRows.length);

          if (!(ScrollContainer && Col && Row && Body && BodyCell)) return <Fragment />; // TODO

          return (
            <ScrollContainer style={{ height: tableHeightPx, overflow: 'auto' }} onScroll={this.handleScroll}>
              {/*{!!headRows.length &&*/}
              {/*HeadTable &&*/}
              {/*Head &&*/}
              {/*HeadCell && (*/}
              {/*<HeadTable style={{ minWidth: tableMinWidthPx }}>*/}
              {/*{ColGroup && (*/}
              {/*<ColGroup>*/}
              {/*{visibleHeadColumns.map(column => (*/}
              {/*<Col key={column.id} style={{ width: column.widthPx }} column={column} />*/}
              {/*))}*/}
              {/*</ColGroup>*/}
              {/*)}*/}
              {/*<Head>*/}
              {/*{visibleHeadRows.map(({ row, cells = [] }) => (*/}
              {/*<RefWrapper key={row.id} ref={(ref: any) => this.setRowRef(row, ref)}>*/}
              {/*<Row>*/}
              {/*{cells.map((cell: any) => {*/}
              {/*const { column } = cell;*/}
              {/*return <HeadCell key={column.id} column={column} rowData={row} />;*/}
              {/*})}*/}
              {/*</Row>*/}
              {/*</RefWrapper>*/}
              {/*))}*/}
              {/*</Head>*/}
              {/*</HeadTable>*/}
              {/*)}*/}
              <BodyTable style={{ minWidth: tableMinWidthPx }}>
                {/*{ColGroup && (*/}
                {/*<ColGroup>*/}
                {/*{visibleBodyColumns.map(column => (*/}
                {/*<Col key={column.id} style={{ width: column.widthPx }} column={column} />*/}
                {/*))}*/}
                {/*</ColGroup>*/}
                {/*)}*/}
                <Body>
                  {visibleBodyRows.map(({ row, cells }) => {
                    return (
                      <RefWrapper key={row.id} ref={(ref: any) => this.setRowRef(row, ref)}>
                        <Row key={row.id} uid={row.id}>
                          {visibleBodyColumns.map(column => (
                            <BodyCell key={column.id} column={column} rowData={row} />
                          ))}
                          {!!cells &&
                            cells.map((cell: any) => {
                              const { column } = cell;
                              return <BodyCell key={column.id} column={column} rowData={row} />;
                            })}
                        </Row>
                      </RefWrapper>
                    );
                  })}
                </Body>
              </BodyTable>
            </ScrollContainer>
          );
        }}
      </SizeMeasurer>
    );
  } // TODO rowData -> row

  /*

<RefWrapper key={row.id} ref={ref => this.setRowRef(row, ref)}>
  <Row
  // tableRow={row}
  // style={!!row.height
  //   ? { height: `${row.height}px` }
  //   : undefined}
  >
    {cells.map(cell => {
      const { column } = cell;
      return (
        <HeadCell
          key={column.id}
          column={column}
          rowData={row}
          //style={column.animationState}
        />
      );
    })}
  </Row>
</RefWrapper>

 */

  private static getVisibleBoundary(
    items: any[],
    viewportStart: number,
    viewportLength: number,
    getItemSize: (item: any) => number,
    overscanCount?: number
  ): { start: number; end: number } {
    let start = null;
    let end = null;

    const viewportEnd = viewportStart + viewportLength;
    let index = 0;
    let beforePosition = 0;
    while (end === null && index < items.length) {
      const item = items[index];
      const afterPosition = beforePosition + getItemSize(item);
      const isVisible =
        (beforePosition >= viewportStart && beforePosition < viewportEnd) ||
        (afterPosition > viewportStart && afterPosition <= viewportEnd) ||
        (beforePosition < viewportStart && afterPosition > viewportEnd);
      if (isVisible && start === null) {
        start = index;
      }
      if (!isVisible && start !== null) {
        end = index - 1;
        break;
      }
      index += 1;
      beforePosition = afterPosition;
    }
    if (start !== null && end === null) {
      end = index - 1;
    }

    start = start === null ? 0 : start;
    end = end === null ? 0 : end;

    if (overscanCount) {
      start = Math.max(0, start - overscanCount);
      end = Math.min(items.length - 1, end + overscanCount);
    }

    return { start, end };
  }

  private static getItemsSize(
    items: any[],
    startIndex: number,
    endIndex: number,
    getItemSize: (item: any) => number
  ): number {
    let size: number = 0;
    for (let index = startIndex; index < endIndex + 1; index += 1) {
      size += getItemSize(items[index]);
    }
    return size;
  }

  private static getVisibleItems(
    // TODO <>
    items: any[],
    visibleBoundary: { start: number; end: number },
    boundaries: Array<{ start: number; end: number }>,
    getItemHeightPx: (item: any) => number,
    createVisibleItem: (item: any) => object,
    createStubItem: (boundary: { start: number; end: number }, dimension: number) => object
  ): object[] {
    const visibleItems: object[] = [];

    boundaries.forEach(boundary => {
      const isVisible = visibleBoundary.start <= boundary.start && boundary.end <= visibleBoundary.end;

      visibleItems.push(
        isVisible
          ? createVisibleItem(items[boundary.start])
          : createStubItem(
              boundary,
              InfiniteTableLayout.getItemsSize(items, boundary.start, boundary.end, getItemHeightPx)
            )
      );
    });

    return visibleItems;
  }

  private static getVisibleStubCells(boundaries: Array<{ start: number; end: number }>): object[] {
    // TODO cell type // TODO visibleCells no stub ??
    const visibleCells: any[] = [];
    let index = 0;

    while (index < boundaries.length) {
      const boundary = boundaries[index];
      visibleCells.push({
        column: {
          id: `${boundary.start}_${boundary.end}_stub`
        }
      });
      index += 1;
    }

    return visibleCells;
  }

  private static getItemBoundaries(
    itemsCount: number,
    boundary: { start: number; end: number }
  ): Array<{ start: number; end: number }> {
    const beforePoints = new Set([0, boundary.start]);
    const afterPoints = new Set([boundary.end, itemsCount - 1]);

    const boundaries: Array<{ start: number; end: number }> = [];

    let lastBeforePoint: number | null = null;
    Array.from(beforePoints)
      .sort((a, b) => a - b)
      .forEach(point => {
        if (lastBeforePoint === null) {
          lastBeforePoint = point;
          return;
        }
        boundaries.push({ start: lastBeforePoint, end: point - 1 });
        lastBeforePoint = point;
      });

    for (let index = boundary.start; index <= boundary.end; index += 1) {
      boundaries.push({ start: index, end: index });
    }

    let lastAfterPoint: number | null = null;
    Array.from(afterPoints)
      .sort((a, b) => a - b)
      .forEach(point => {
        if (lastAfterPoint === null) {
          lastAfterPoint = point;
          return;
        }
        boundaries.push({ start: lastAfterPoint + 1, end: point });
        lastAfterPoint = point;
      });

    return boundaries;
  }
}

export { InfiniteTableLayout, IInfiniteTableLayoutProps, IInfiniteTableLayoutState };
