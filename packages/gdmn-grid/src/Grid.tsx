import React, { Component } from 'react';
import {
  AutoSizer,
  Grid,
  GridCellProps,
  Index,
  IndexRange,
  InfiniteLoader,
  InfiniteLoaderChildProps,
  SectionRenderedParams
} from 'react-virtualized';
import './Grid.css';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';
import cn from 'classnames';
import Draggable, { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { FieldDefs, RecordSet, SortFields, TRowType, TSortOrder, TStatus, TRowState } from 'gdmn-recordset';
import GDMNSortDialog from './SortDialog';
import { OnScroll, OnScrollParams } from './SyncScroll';
import { ParamsDialog } from './ParamsDialog';

const MIN_GRID_COLUMN_WIDTH = 20;

export interface IColumn {
  name: string;
  caption?: string[];
  fields: FieldDefs;
  hidden?: boolean;
  width?: number;
}

export type Columns = IColumn[];

export interface IGridEvent {
  ref: GDMNGrid;
  rs: RecordSet;
}

export type TCancelSortDialogEvent = IGridEvent;
export type TApplySortDialogEvent = IGridEvent & {sortFields: SortFields};
export type TColumnResizeEvent = IGridEvent & {columnIndex: number, newWidth: number};
export type TColumnMoveEvent = IGridEvent & {oldIndex: number, newIndex: number};
export type TSetCursorPosEvent = IGridEvent & {cursorCol: number, cursorRow: number};
export type TSortEvent = IGridEvent & {sortFields: SortFields};
export type TSelectRowEvent = IGridEvent & {idx: number, selected: boolean};
export type TSelectAllRowsEvent = IGridEvent & {value: boolean};
export type TToggleGroupEvent = IGridEvent & {rowIdx: number};
export type TLoadMoreRsDataEvent = IGridEvent & IndexRange;

export type TEventCallback<T, R = void> = (event: T) => R;

export interface IGridProps {
  rs: RecordSet;
  columns: Columns;
  leftSideColumns: number;
  rightSideColumns: number;
  currentCol: number;
  selectRows?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  sortDialog: boolean;
  savedState?: IGridState;
  onCancelSortDialog: TEventCallback<TCancelSortDialogEvent>;
  onApplySortDialog: TEventCallback<TApplySortDialogEvent>;
  onColumnResize: TEventCallback<TColumnResizeEvent>;
  onColumnMove: TEventCallback<TColumnMoveEvent>;
  onSetCursorPos: TEventCallback<TSetCursorPosEvent>;
  onSort: TEventCallback<TSortEvent>;
  onSelectRow: TEventCallback<TSelectRowEvent>;
  onSelectAllRows: TEventCallback<TSelectAllRowsEvent>;
  onToggleGroup: TEventCallback<TToggleGroupEvent>;
  loadMoreRsData?: TEventCallback<TLoadMoreRsDataEvent, Promise<any>>;
  loadMoreThresholdPages?: number;
  loadMoreMinBatchPagesRatio?: number;
}

export interface IGridState {
  columnWidth: number;
  rowHeight: number;
  overscanColumnCount: number;
  overscanRowCount: number;
  columnBeingResized: boolean;
  scrollLeft: number;
  scrollTop: number;
  showDialogParams: boolean;
}

export const styles = {
  GridContainer: 'GridContainer',
  SideContainer: 'SideContainer',
  SideHeader: 'SideHeader',
  SideRows: 'SideRows',
  SideFooter: 'SideFooter',
  BodyContainer: 'BodyContainer',
  BodyHeader: 'BodyHeader',
  BodyRows: 'BodyRows',
  HeaderGrid: 'HeaderGrid',
  BodyGrid: 'BodyGrid',
  BodyGridNoVScroll: 'BodyGridNoVScroll',
  BodyGridNoHScroll: 'BodyGridNoHScroll',
  BodyGridVScroll: 'BodyGridVScroll',
  BodyGridHScroll: 'BodyGridHScroll',
  BodyFooter: 'BodyFooter',
  SideFooterGrid: 'SideFooterGrid',
  BodyFooterGrid: 'BodyFooterGrid',
  CurrentCellBackground: 'CurrentCellBackground',
  CurrentRowBackground: 'CurrentRowBackground',
  EvenRowBackground: 'EvenRowBackground',
  OddRowBackground: 'OddRowBackground',
  SelectedBackground: 'SelectedBackground',
  CellColumn: 'CellColumn',
  CellRow: 'CellRow',
  CellMarkArea: 'CellMarkArea',
  HeaderCell: 'HeaderCell',
  FooterCell: 'FooterCell',
  FixedCell: 'FixedCell',
  FixedBackground: 'FixedBackground',
  CellCaption: 'CellCaption',
  DataCellLeft: 'DataCellLeft',
  DataCellCenter: 'DataCellCenter',
  DataCellRight: 'DataCellRight',
  LeftSideGrid: 'LeftSideGrid',
  RightSideCellFooter: 'RightSideCellFooter',
  LeftSideCellFooter: 'LeftSideCellFooter',
  RightSideGrid: 'RightSideGrid',
  ResizingColumn: 'ResizingColumn',
  GridColumnSortAsc: 'GridColumnSortAsc',
  GridColumnSortDesc: 'GridColumnSortDesc',
  GridColumnDragging: 'GridColumnDragging',
  DragHandleIcon: 'DragHandleIcon',
  GroupHeaderBackground: 'GroupHeaderBackground',
  BorderBottom: 'BorderBottom',
  BorderRight: 'BorderRight',
  FixedBorder: 'FixedBorder',
  BlackText: 'BlackText',
  GrayText: 'GrayText',
  Deleting: 'RowBeingDeleted',
  Deleted: 'RowDeleted'
};

export function visibleToIndex(columns: Columns, visibleIndex: number) {
  let vi = -1;
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].hidden) {
      vi++;
    }

    if (vi === visibleIndex) {
      return i;
    }
  }
  if (vi === -1) {
    throw new Error(`Invalid visible column index ${visibleIndex}`);
  } else {
    return vi;
  }
}

type AdjustColumnIndexFunc = (gridColumnIndex: number) => number;

export type ScrollIntoView = (recordIndex: number, columnIndex?: number) => void;

export type GetGridRef = () => GDMNGrid;

export class GDMNGrid extends Component<IGridProps, IGridState> {
  private _leftSideHeaderGrid: Grid | undefined;
  private _leftSideRowsGrid: Grid | undefined;
  private _leftSideFooterGrid: Grid | undefined;
  private _bodyHeaderGrid: Grid | undefined;
  private _bodyRowsGrid: Grid | undefined;
  private _bodyFooterGrid: Grid | undefined;
  private _rightSideHeaderGrid: Grid | undefined;
  private _rightSideRowsGrid: Grid | undefined;
  private _rightSideFooterGrid: Grid | undefined;
  private _columnMovingDeltaX: number = 0;
  private _columnSizingDeltaX: number = 0;
  private _scrollIntoView?: ScrollIntoView = undefined;
  private _deltaWidth: number = 0;

  private onCloseDialogParams = () => {
    this.setState({ showDialogParams: false });
  }

  public static defaultProps: Partial<IGridProps> = {
    loadMoreRsData: () => Promise.resolve(),
    loadMoreThresholdPages: 2,
    loadMoreMinBatchPagesRatio: 2
  };

  constructor(props: IGridProps) {
    super(props);
    const maxCountFieldInCell = props.columns.reduce((max, c) => (c.fields.length > max ? c.fields.length : max), 0);
    const inCellRowHeight = 18;
    const totalCellVertPadding = 2;
    this.state = props.savedState || {
      columnWidth: 125,
      overscanColumnCount: 5,
      overscanRowCount: 20,
      rowHeight:
        maxCountFieldInCell === 1
          ? inCellRowHeight + totalCellVertPadding
          : maxCountFieldInCell * inCellRowHeight + totalCellVertPadding,
      columnBeingResized: false,
      scrollLeft: 0,
      scrollTop: 0,
      showDialogParams: false
    };
  }

  public shouldComponentUpdate(
    nextProps: Readonly<IGridProps>,
    nextState: Readonly<IGridState>,
    _nextContext: any
  ): boolean {
    const changed: boolean =
      !!this.props.columns.find(
        (c, idx) =>
          nextProps.columns[idx] &&
          (typeof c.width !== typeof nextProps.columns[idx].width ||
            c.width !== nextProps.columns[idx].width ||
            c.name !== nextProps.columns[idx].name)
      ) ||
      this.state.columnBeingResized !== nextState.columnBeingResized;

    if (changed) {
      const recompute = (g: Grid | undefined) => {
        if (g) {
          g.recomputeGridSize();
        }
      };
      recompute(this._leftSideHeaderGrid);
      recompute(this._leftSideRowsGrid);
      recompute(this._leftSideFooterGrid);
      recompute(this._bodyHeaderGrid);
      recompute(this._bodyRowsGrid);
      recompute(this._bodyFooterGrid);
      recompute(this._rightSideHeaderGrid);
      recompute(this._rightSideRowsGrid);
      recompute(this._rightSideFooterGrid);
    }
    return true;
  }

  public componentWillUnmount() {
    this._scrollIntoView = undefined;
  }

  public scrollIntoView: ScrollIntoView = (recordIndex: number = -1, columnIndex?: number) => {
    if (this._scrollIntoView) {
      this._scrollIntoView(recordIndex, columnIndex);
    }
  };

  public async loadFully(batchSize: number): Promise<void> {
    if (this.props.loadMoreRsData) {
      while (this.props.rs.status === TStatus.PARTIAL) {
        await this.props.loadMoreRsData({
          ref: this,
          rs: this.props.rs,
          startIndex: this.props.rs.size,
          stopIndex: this.props.rs.size + batchSize
        });
      }
    }
  }

  public render() {
    const {
      columns,
      rs,
      leftSideColumns,
      rightSideColumns,
      hideHeader,
      hideFooter,
      sortDialog,
      onCancelSortDialog,
      onApplySortDialog,
      onSetCursorPos,
      loadMoreRsData,
      loadMoreThresholdPages,
      loadMoreMinBatchPagesRatio,
      currentCol
    } = this.props;
    const { rowHeight, overscanColumnCount, overscanRowCount, showDialogParams } = this.state;

    if (!rs) {
      return <div>No data!</div>;
    }

    const columnCount = columns.length;

    if (!columnCount) {
      return undefined;
    }

    const composeGrid = (width: number, height: number, scrollLeft: number, sTop: number, onScroll: OnScroll) => {
      const getLeftSideColumnWidth = this._getColumnMeasurer(this._adjustLeftSideColumnIndex, true);
      const getBodyColumnWidth = this._getColumnMeasurer(this._adjustBodyColumnIndex, false);
      const getRightSideColumnWidth = this._getColumnMeasurer(this._adjustRightSideColumnIndex, true);

      let leftSideColumnsWidth = 0;
      for (let index = 0; index < leftSideColumns; index++) {
        leftSideColumnsWidth += getLeftSideColumnWidth({ index });
      }

      const sbSize = scrollbarSize();

      let rightSideColumnsWidth = 0;
      for (let index = 0; index < rightSideColumns; index++) {
        rightSideColumnsWidth += getRightSideColumnWidth({ index });
      }
      const rightSideWidth = rightSideColumnsWidth ? rightSideColumnsWidth + sbSize : 0;

      const bodyColumns = columnCount - leftSideColumns - rightSideColumns;

      const headerHeight = hideHeader ? 0 : rowHeight;
      const footerHeight = hideFooter ? 0 : rowHeight + sbSize;

      const bodyHeight = height - headerHeight - footerHeight - 1;

      const dataRowCount = rs.size;
      // rowCount can be greater than rs.size because we need in
      // drawing fake rows down to full height of grid's body
      const rowCount = Math.max(dataRowCount, Math.ceil(bodyHeight / rowHeight));
      const scrollHeight = rowCount * rowHeight;
      const currentRow = rs.currentRow;

      const bodyWidth = width - leftSideColumnsWidth - rightSideWidth - 1;
      const bodyColumnsWidth = rightSideColumns ? bodyWidth : (bodyWidth <= sbSize ? 0 : bodyWidth - sbSize);

      const scrollTop =
        scrollHeight <= bodyHeight ? 0 : sTop >= scrollHeight - rowHeight ? scrollHeight - bodyHeight : sTop;

      const bodyCountRows = Math.floor(bodyHeight / rowHeight); /* page size */
      const bodyBottomRow = Math.floor((scrollTop + bodyHeight) / rowHeight);

      /* ' || 1'  - 0 protection, Math.max - negative protection */
      const infiniteLoadThreshold = Math.max(loadMoreThresholdPages || 1, 1) * (bodyCountRows || 1);
      const infiniteLoadMinimumBatchSize = infiniteLoadThreshold * Math.max(loadMoreMinBatchPagesRatio || 1, 1);

      this._scrollIntoView = (recordIndex: number, columnIndex?: number) => {
        if (!bodyHeight) {
          return;
        }

        let newScrollTop: number;

        const ri = recordIndex < 0 ? currentRow : recordIndex;
        const rTop = ri * rowHeight;

        if (rTop >= scrollTop && rTop <= scrollTop + bodyHeight - rowHeight) {
          newScrollTop = scrollTop;
        } else {
          if (rTop <= bodyHeight - rowHeight) {
            newScrollTop = 0;
          } else if (scrollHeight - rTop <= bodyHeight) {
            newScrollTop = scrollHeight - bodyHeight;
          } else {
            newScrollTop = rTop - Math.floor((bodyHeight - rowHeight) / 2);
          }
        }

        let newScrollLeft = scrollLeft;

        if (typeof columnIndex === 'number') {
          const bodyColumnIndex = columnIndex - leftSideColumns;

          if (bodyColumnIndex >= 0 && bodyColumnIndex < bodyColumns) {
            const cellWidth = getBodyColumnWidth({ index: bodyColumnIndex });

            let cellLeft = 0;
            for (let index = 0; index <= bodyColumnIndex; index++) {
              cellLeft += getBodyColumnWidth({ index });
            }

            if (cellLeft < scrollLeft) {
              newScrollLeft = cellLeft;
            } else if (cellLeft >= scrollLeft + bodyWidth - cellWidth) {
              newScrollLeft = cellLeft - bodyWidth + cellWidth;
            }
          }
        }

        onScroll({
          scrollLeft: newScrollLeft,
          scrollTop: newScrollTop
        });
      };

      const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        let newCol = currentCol;
        let newRow = currentRow;

        switch (e.key) {
          case 'ArrowDown':
            if (currentRow < dataRowCount - 1) {
              newRow = currentRow + 1;
            }
            break;

          case 'ArrowUp':
            if (currentRow > 0) {
              newRow = currentRow - 1;
            }
            break;

          case 'ArrowLeft':
            if (currentCol > leftSideColumns) {
              newCol = currentCol - 1;
            }
            break;

          case 'ArrowRight':
            if (currentCol < columns.length - rightSideColumns - 1) {
              newCol = currentCol + 1;
            }
            break;

          case 'PageDown':
            if (currentRow < dataRowCount - 1) {
              newRow =
                currentRow > dataRowCount - 1 - bodyCountRows
                  ? dataRowCount - 1
                  : bodyBottomRow + (currentRow === bodyBottomRow ? bodyCountRows : 0);
            }
            break;

          case 'PageUp':
            if (currentRow > 0) {
              newRow =
                currentRow === rowCount
                  ? rowCount - 1
                  : currentRow < bodyCountRows
                  ? 0
                  : scrollTop === rowHeight * currentRow
                  ? currentRow - bodyCountRows
                  : Math.floor(scrollTop / rowHeight);
            }
            break;

          case 'Home':
            if (currentCol > leftSideColumns) {
              newCol = leftSideColumns;
            }
            break;

          case 'End':
            if (currentCol < columns.length - rightSideColumns - 1) {
              newCol = columns.length - rightSideColumns - 1;
            }
            break;

          case 'F10':
            this.setState({ showDialogParams: true });
            break;

          default:
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const newCellTop = newRow * rowHeight;
        let newCellLeft = 0;
        for (let i = leftSideColumns; i < newCol; i++) {
          newCellLeft += getBodyColumnWidth({ index: i - leftSideColumns });
        }
        const newCellBottom = newCellTop + rowHeight - 1;
        const newCellRight = newCellLeft + getBodyColumnWidth({ index: newCol - leftSideColumns }) - 1;

        let offsetTop = 0;

        if (newCellTop < scrollTop) {
          offsetTop = newCellTop - scrollTop;
        } else if (newCellBottom > scrollTop + bodyHeight) {
          offsetTop = newCellBottom - scrollTop - bodyHeight;
        }

        let offsetLeft = 0;

        if (newCellLeft < scrollLeft) {
          offsetLeft = newCellLeft - scrollLeft;
        } else if (newCellRight > scrollLeft + bodyWidth) {
          offsetLeft = newCellRight - scrollLeft - bodyWidth;
        }

        onSetCursorPos({ref: this, rs, cursorCol: newCol, cursorRow: newRow});

        if (offsetTop || offsetLeft) {
          onScroll({
            scrollLeft: scrollLeft + offsetLeft,
            scrollTop: scrollTop + offsetTop
          });
        }
      };

      const onScrollWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        let newCol = currentCol;
        let newRow = currentRow;

        let offsetTop = 0;

        let newscrollTop =
          e.deltaY < 0
            ? Math.max(0, scrollTop + (e.altKey ? 1 : e.deltaY) * rowHeight)
            : Math.min(scrollHeight - bodyHeight, scrollTop + (e.altKey ? 1 : e.deltaY) * rowHeight);

        if (e.altKey) {
          if (e.deltaY > 0) {
            if (currentRow < rowCount - 1) {
              newRow = currentRow + 1;
            }
          } else {
            if (currentRow > 0) {
              newRow = currentRow - 1;
            }
          }

          const newCellTop = newRow * rowHeight;
          const newCellBottom = newCellTop + rowHeight - 1;

          if (newCellTop < scrollTop) {
            offsetTop = newCellTop - scrollTop;
          } else if (newCellBottom > scrollTop + bodyHeight) {
            offsetTop = newCellBottom - scrollTop - bodyHeight;
          }
          onSetCursorPos({ref: this, rs, cursorCol: newCol, cursorRow: newRow});
          newscrollTop = scrollTop + offsetTop;
        }

        if (offsetTop || !e.altKey) {
          onScroll({
            scrollLeft,
            scrollTop: newscrollTop
          });
        }
      };

      const leftSide = () => {
        if (!leftSideColumns) {
          return undefined;
        }

        const leftSideHeader = () =>
          hideHeader ? (
            undefined
          ) : (
            <div className={styles.SideHeader}>
              <Grid
                cellRenderer={this._getHeaderCellRenderer(
                  this._adjustLeftSideColumnIndex,
                  false,
                  leftSideColumns,
                  true
                )}
                className={styles.HeaderGrid}
                width={leftSideColumnsWidth}
                height={headerHeight}
                rowHeight={rowHeight}
                columnWidth={getLeftSideColumnWidth}
                rowCount={1}
                columnCount={leftSideColumns}
                ref={g => g && (this._leftSideHeaderGrid = g)}
              />
            </div>
          );

        const leftSideRows = () => (
          <div className={styles.SideRows}>
            <Grid
              overscanRowCount={overscanRowCount}
              cellRenderer={this._getRowsCellRenderer(this._adjustLeftSideColumnIndex, true)}
              columnWidth={getLeftSideColumnWidth}
              columnCount={leftSideColumns}
              className={styles.LeftSideGrid}
              height={bodyHeight}
              rowHeight={rowHeight}
              rowCount={rowCount}
              scrollTop={scrollTop}
              width={leftSideColumnsWidth}
              onScroll={params =>
                onScroll({
                  scrollLeft: scrollLeft,
                  scrollTop: params.scrollTop
                })
              }
              ref={g => g && (this._leftSideRowsGrid = g)}
            />
          </div>
        );

        const leftSideFooter = () =>
          hideFooter ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: leftSideColumnsWidth,
                height: sbSize
              }}
            >
              <div className={cn(styles.CellColumn, styles.RightSideCellFooter, styles.LeftSideCellFooter)} />
            </div>
          ) : (
            <div className={styles.SideFooter}>
              <Grid
                cellRenderer={this._getFooterCellRenderer(this._adjustLeftSideColumnIndex, true)}
                className={styles.SideFooterGrid}
                width={leftSideColumnsWidth}
                height={footerHeight}
                rowHeight={rowHeight}
                columnWidth={getLeftSideColumnWidth}
                rowCount={1}
                columnCount={leftSideColumns}
                ref={g => g && (this._leftSideFooterGrid = g)}
              />
            </div>
          );

        return (
          <div className={styles.SideContainer}>
            {leftSideHeader()}
            {leftSideRows()}
            {leftSideFooter()}
          </div>
        );
      };

      const body = () => {
        const bodyHeader = () => (
          <div className={styles.BodyHeader}>
            <Grid
              className={styles.HeaderGrid}
              columnWidth={getBodyColumnWidth}
              columnCount={bodyColumns + (this._deltaWidth ? 1 : 0)}
              height={headerHeight}
              overscanColumnCount={overscanColumnCount}
              cellRenderer={this._getHeaderCellRenderer(
                this._adjustBodyColumnIndex,
                true,
                bodyColumns + (this._deltaWidth ? 1 : 0),
                false
              )}
              rowHeight={rowHeight}
              rowCount={1}
              scrollLeft={scrollLeft}
              width={bodyColumnsWidth}
              ref={g => g && (this._bodyHeaderGrid = g)}
            />
            {rightSideColumns ? (
              undefined
            ) : (
              <div className={cn(styles.CellColumn, styles.HeaderCell)}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: sbSize + 1,
                  height: headerHeight,
                  borderRight: 'none',
                  borderLeft: 'none'
                }}
              >
                {/* <div className={cn(styles.CellColumn, styles.HeaderCell)} /> */}
              </div>
            )}
          </div>
        );

        const getOnSectionRendered = (infiniteLoaderChildProps: InfiniteLoaderChildProps) => ({
          rowStartIndex,
          rowStopIndex
        }: SectionRenderedParams) => {
          const startIndex = rowStartIndex; // * columnCount + columnStartIndex;
          const stopIndex = rowStopIndex; // * columnCount + columnStopIndex;

          infiniteLoaderChildProps.onRowsRendered({
            startIndex,
            stopIndex
          });
        };

        const bodyRows = () => (
          <div
            className={styles.BodyRows}
            onWheel={
              !rightSideColumns
                ? undefined
                : e => onScrollWheel(e)
            }
          >
            <InfiniteLoader
              isRowLoaded={this._isRowLoaded}
              loadMoreRows={
                rs.status === TStatus.PARTIAL
                  ? (params) => loadMoreRsData!({ref: this, rs, ...params})
                  : () => Promise.resolve()
              }
              rowCount={rs.size + infiniteLoadMinimumBatchSize}
              minimumBatchSize={infiniteLoadMinimumBatchSize}
              threshold={infiniteLoadThreshold}
            >
              {infiniteLoaderChildProps => {
                return (
                  <Grid
                    className={cn(
                      styles.BodyGrid,
                      rightSideColumns ? styles.BodyGridNoVScroll : styles.BodyGridVScroll,
                      !hideFooter ? styles.BodyGridNoHScroll : styles.BodyGridHScroll
                    )}
                    columnWidth={getBodyColumnWidth}
                    columnCount={bodyColumns + (this._deltaWidth ? 1 : 0)}
                    height={bodyHeight}
                    overscanColumnCount={overscanColumnCount}
                    overscanRowCount={overscanRowCount}
                    cellRenderer={this._getRowsCellRenderer(this._adjustBodyColumnIndex, false)}
                    rowHeight={rowHeight}
                    rowCount={rowCount}
                    width={bodyWidth}
                    onScroll={
                      !rightSideColumns || hideFooter
                        ? ({ scrollLeft, scrollTop }) =>
                            onScroll({
                              scrollLeft,
                              scrollTop
                            })
                        : undefined
                    }
                    scrollLeft={scrollLeft}
                    scrollTop={scrollTop}
                    ref={g => {
                      if (g) {
                        this._bodyRowsGrid = g;
                        infiniteLoaderChildProps.registerChild(g);
                      }
                    }}
                    onSectionRendered={getOnSectionRendered(infiniteLoaderChildProps)}
                  />
                );
              }}
            </InfiniteLoader>
          </div>
        );

        const bodyFooter = () => (
          <div className={styles.BodyFooter}>
            <Grid
              className={styles.BodyFooterGrid}
              columnWidth={getBodyColumnWidth}
              columnCount={bodyColumns + (this._deltaWidth ? 1 : 0)}
              height={footerHeight}
              overscanColumnCount={overscanColumnCount}
              cellRenderer={this._getFooterCellRenderer(this._adjustBodyColumnIndex, false)}
              rowHeight={rowHeight}
              rowCount={1}
              scrollLeft={scrollLeft}
              width={bodyColumnsWidth}
              onScroll={params =>
                onScroll({
                  scrollLeft: params.scrollLeft,
                  scrollTop: scrollTop
                })
              }
              ref={g => g && (this._bodyFooterGrid = g)}
            />
          </div>
        );

        return (
          <div className={styles.BodyContainer}>
            {bodyHeader()}
            {bodyRows()}
            {bodyFooter()}
          </div>
        );
      };

      const rightSideHeader = () =>
        hideHeader ? (
          undefined
        ) : (
          <div className={styles.SideHeader}>
            <Grid
              cellRenderer={this._getHeaderCellRenderer(
                this._adjustRightSideColumnIndex,
                false,
                rightSideColumns,
                true
              )}
              className={styles.HeaderGrid}
              width={rightSideColumnsWidth}
              height={headerHeight}
              rowHeight={rowHeight}
              columnWidth={getRightSideColumnWidth}
              rowCount={1}
              columnCount={rightSideColumns}
              ref={g => g && (this._rightSideHeaderGrid = g)}
            />
          </div>
        );

      const rightSideRows = () => (
        <div className={styles.SideRows}>
          <Grid
            overscanRowCount={overscanRowCount}
            cellRenderer={this._getRowsCellRenderer(this._adjustRightSideColumnIndex, true)}
            columnWidth={getRightSideColumnWidth}
            columnCount={rightSideColumns}
            className={styles.RightSideGrid}
            height={bodyHeight}
            rowHeight={rowHeight}
            rowCount={rowCount}
            scrollTop={scrollTop}
            width={rightSideWidth}
            onScroll={params =>
              onScroll({
                scrollLeft: scrollLeft,
                scrollTop: params.scrollTop
              })
            }
            ref={g => g && (this._rightSideRowsGrid = g)}
          />
        </div>
      );

      const rightSideFooter = () =>
        hideFooter ? (
          <div>
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: rightSideWidth - 1,
                height: sbSize
              }}
            >
              <div className={cn(styles.CellColumn, styles.RightSideCellFooter)} />
            </div>
          </div>
        ) : (
          <div className={styles.SideFooter}>
            <Grid
              cellRenderer={this._getFooterCellRenderer(this._adjustRightSideColumnIndex, true)}
              className={styles.SideFooterGrid}
              width={rightSideColumnsWidth}
              height={footerHeight}
              rowHeight={rowHeight}
              columnWidth={getRightSideColumnWidth}
              rowCount={1}
              columnCount={rightSideColumns}
              ref={g => g && (this._rightSideFooterGrid = g)}
            />
          </div>
        );

      const rightSide = () => {
        if (!rightSideColumns) {
          return undefined;
        }

        return (
          <div className={styles.SideContainer}>
            {rightSideHeader()}
            {rightSideRows()}
            {rightSideFooter()}
          </div>
        );
      };

      return (
        <div className={styles.GridContainer} onKeyDown={e => onKeyDown(e)}>
          {leftSide()}
          {body()}
          {rightSide()}
        </div>
      );
    };

    return (
      <div className="GridBody">
        <AutoSizer>
          {({ width, height }) => {
            this._deltaWidth =
              width -
              columns.reduce((w, c) => (c.width ? w + c.width : w + this.state.columnWidth), 0) -
              scrollbarSize() - 1;

            if (this._deltaWidth < 0) {
              this._deltaWidth = 0;
            }

            const { scrollLeft, scrollTop } = this.state;

            return composeGrid(width, height, scrollLeft, scrollTop, (params: OnScrollParams) =>
              this.setState({ ...params })
            );
          }}
        </AutoSizer>
        {sortDialog ? (
          <GDMNSortDialog
            fieldDefs={rs.fieldDefs}
            sortFields={rs.sortFields}
            onCancel={() => onCancelSortDialog({ref: this, rs})}
            onApply={(sortFields) => onApplySortDialog({ref: this, rs, sortFields})}
          />
        ) : (
          undefined
        )}
        {showDialogParams ? (
          <ParamsDialog onCancel={this.onCloseDialogParams} columns={columns} onToggle={() => {}} />
        ) : (
          undefined
        )}
      </div>
    );
  }

  private _getColumnLabel = (columnIndex: number): string[] => {
    const { columns } = this.props;
    const column = columns[columnIndex];

    if (!column) {
      return [];
    }

    return column.caption || (column.fields.map(f => f.caption) && []);
  };

  private _adjustLeftSideColumnIndex = (gridColumnIndex: number): number => {
    return gridColumnIndex;
  };

  private _adjustBodyColumnIndex = (gridColumnIndex: number): number => {
    return gridColumnIndex + this.props.leftSideColumns;
  };

  private _adjustRightSideColumnIndex = (gridColumnIndex: number): number => {
    return this.props.columns.length - this.props.rightSideColumns + gridColumnIndex;
  };

  private _getHeaderCellRenderer = (
    adjustFunc: AdjustColumnIndexFunc,
    movable: boolean,
    columnsCount: number,
    fixed: boolean
  ) => ({ style, columnIndex, key }: GridCellProps) => {
    const { columnBeingResized } = this.state;
    const {
      onColumnResize,
      onSort,
      columns,
      rs,
      selectRows,
      onSelectAllRows,
      rightSideColumns,
      leftSideColumns
    } = this.props;

    const adjustedColumnIndex = adjustFunc(columnIndex);
    const getColumnWidth = this._getColumnMeasurer(adjustFunc, fixed);

    if (fixed || adjustedColumnIndex !== columns.length - rightSideColumns) {
      const column = columns[adjustedColumnIndex];
      const columnField = column.fields[0];
      const sortField = rs.sortFields.find(sf => sf.fieldName === columnField.fieldName);
      const sortOrder: TSortOrder = !sortField ? 'UNDEFINED' : sortField.asc ? 'ASC' : 'DESC';

      const draggableCore = (
        <DraggableCore
          onStart={this._onStartColumnResizing}
          onStop={this._onStopColumnResizing}
          onDrag={(_, { deltaX }) => {
            this._columnSizingDeltaX += deltaX;
            const newWidth = getColumnWidth({ index: columnIndex }) + this._columnSizingDeltaX;
            if (newWidth > MIN_GRID_COLUMN_WIDTH) {
              onColumnResize({ref: this, rs, columnIndex: adjustedColumnIndex, newWidth});
              this._columnSizingDeltaX = 0;
            }
          }}
        >
          <div className={styles.DragHandleIcon} />
        </DraggableCore>
      );

      let innerCell: JSX.Element;

      if (selectRows && !adjustedColumnIndex) {
        const classNames = cn(
          styles.CellRow,
          styles.HeaderCell,
          sortOrder === 'ASC' ? styles.GridColumnSortAsc : sortOrder === 'DESC' ? styles.GridColumnSortDesc : '',
          columnBeingResized ? styles.ResizingColumn : ''
        );

        const selectedRowsCount = rs.selectedRows.reduce((p, sr) => (sr ? p + 1 : p), 0);

        innerCell = (
          <div key={key} className={classNames} style={style}>
            <div
              className={styles.CellMarkArea}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                onSelectAllRows({ref: this, rs, value: !rs.allRowsSelected});
              }}
            >
              {rs.allRowsSelected || selectedRowsCount === rs.size ? '☑' : selectedRowsCount ? '☒' : '☐'}
            </div>
            <div className={styles.CellColumn}>
              <div
                className={styles.CellCaption}
                onClick={() => {
                  if (!this._columnMovingDeltaX && !this._columnSizingDeltaX) {
                    onSort({
                      ref: this,
                      rs,
                      sortFields: [{ fieldName: columnField.fieldName, asc: sortOrder !== 'ASC' }]
                    });
                  }
                }}
              >
                {this._getColumnLabel(adjustedColumnIndex).map((l, idx) => (
                  <span key={idx}>{l}</span>
                ))}
              </div>
            </div>
            {draggableCore}
          </div>
        );
      } else {
        const classNames = cn(
          styles.CellColumn,
          styles.HeaderCell,
          sortOrder === 'ASC' ? styles.GridColumnSortAsc : sortOrder === 'DESC' ? styles.GridColumnSortDesc : '',
          columnBeingResized ? styles.ResizingColumn : ''
        );

        innerCell = (
          <div key={key} className={classNames} style={style}>
            <div
              className="CellCaption"
              onClick={() => {
                if (!this._columnMovingDeltaX && !this._columnSizingDeltaX) {
                  onSort({
                    ref: this,
                    rs,
                    sortFields: [{ fieldName: columnField.fieldName, asc: sortOrder !== 'ASC' }]
                  });
                }
              }}
            >
              {this._getColumnLabel(adjustedColumnIndex).map((l, idx) => (
                <span key={idx}>{l}</span>
              ))}
            </div>
            {draggableCore}
          </div>
        );
      }

      if (!movable) {
        return innerCell;
      }

      return (
        <Draggable
          key={key}
          axis="x"
          handle=".CellCaption"
          position={{ x: 0, y: 0 }}
          defaultClassNameDragging={styles.GridColumnDragging}
          onStart={this._onDragColumnStart}
          onDrag={this._onDragColumn}
          onStop={() => {
            const { onColumnMove } = this.props;
            if (this._columnMovingDeltaX < 0 && columnIndex > 0) {
              let d = -this._columnMovingDeltaX;
              let ec = columnIndex;
              while (ec > 0 && d > getColumnWidth({ index: ec - 1 }) / 2) {
                d -= getColumnWidth({ index: --ec });
              }
              if (columnIndex !== ec) {
                onColumnMove({ref: this, rs, oldIndex: adjustedColumnIndex, newIndex: adjustFunc(ec)});
              }
            } else if (this._columnMovingDeltaX > 0 && columnIndex < columnsCount - 1) {
              let d = this._columnMovingDeltaX;
              let ec = columnIndex;
              while (ec < columnsCount - 1 && d > getColumnWidth({ index: ec + 1 }) / 2) {
                d -= getColumnWidth({ index: ++ec });
              }
              if (
                columnIndex !== ec &&
                !(ec === columns.length - rightSideColumns - leftSideColumns && this._deltaWidth > 0)
              ) {
                onColumnMove({ref: this, rs, oldIndex: adjustedColumnIndex, newIndex: adjustFunc(ec)});
              }
            }
          }}
        >
          {innerCell}
        </Draggable>
      );
    } else {
      return <div key={key} className={cn(styles.CellColumn, styles.HeaderCell)} style={style} />;
    }
  };

  private _onStartColumnResizing = () => {
    this.setState({ columnBeingResized: true });
    this._columnSizingDeltaX = 0;
  };

  private _onStopColumnResizing = () => {
    this.setState({ columnBeingResized: false });
    this._columnSizingDeltaX = 0;
  };

  private _onDragColumnStart: DraggableEventHandler = () => {
    this._columnMovingDeltaX = 0;
  };

  private _onDragColumn: DraggableEventHandler = (_, { deltaX }) => {
    this._columnMovingDeltaX += deltaX;
  };

  private _getRowsCellRenderer = (adjustFunc: AdjustColumnIndexFunc, fixed: boolean) => ({
    columnIndex,
    key,
    rowIndex,
    style
  }: GridCellProps) => {
    const {
      columns,
      rs,
      currentCol,
      onSetCursorPos,
      selectRows,
      onSelectRow,
      onToggleGroup,
      rightSideColumns
    } = this.props;
    const currentRow = rs.currentRow;
    const adjustedColumnIndex = adjustFunc(columnIndex);

    if (rowIndex >= rs.size) {
      // draw fake row

      const backgroundClass = fixed
        ? styles.FixedBackground
        : rowIndex % 2 === 0
        ? styles.EvenRowBackground
        : styles.OddRowBackground;
      const borderClass = fixed ? styles.FixedBorder : styles.BorderRight;

      return (
        <div
          className={cn(backgroundClass, borderClass, styles.CellColumn)}
          key={key}
          style={style}
        />
      );
    }

    const rowData = rs.get(rowIndex);
    const groupHeader = rowData.type === TRowType.HeaderExpanded || rowData.type === TRowType.HeaderCollapsed;
    const footer = rowData.type === TRowType.Footer;
    const rowState = rs.getRowState(rowIndex);

    let backgroundClass;

    if (rowState === TRowState.Normal) {
      backgroundClass = fixed
        ? styles.FixedBackground
        : currentRow === rowIndex
        ? adjustedColumnIndex === currentCol
          ? styles.CurrentCellBackground
          : styles.CurrentRowBackground
        : selectRows && (rs.allRowsSelected || rs.selectedRows[rowIndex])
        ? styles.SelectedBackground
        : groupHeader
        ? styles.GroupHeaderBackground
        : rowIndex % 2 === 0
        ? styles.EvenRowBackground
        : styles.OddRowBackground;
    }
    else if (rowState === TRowState.Deleting) {
      backgroundClass = styles.Deleting;
    } else {
      backgroundClass = styles.Deleted;
    }

    const borderClass = fixed ? styles.FixedBorder : groupHeader ? styles.BorderBottom : styles.BorderRight;

    const textClass =
      !groupHeader && rowData.group && adjustedColumnIndex <= rowData.group.level ? styles.GrayText : styles.BlackText;

    if (groupHeader && rowData.group && adjustedColumnIndex > rowData.group.level) {
      return (
        <div
          className={cn(backgroundClass, borderClass)}
          key={key}
          style={style}
          onClick={() => {
            onSetCursorPos({ref: this, rs, cursorCol: adjustedColumnIndex, cursorRow: rowIndex});
          }}
        />
      );
    }

    const groupRecCount =
      groupHeader && rowData.group && adjustedColumnIndex === rowData.group.level ? (
        <sup>{rowData.group.bufferCount}</sup>
      ) : (
        undefined
      );

    const cellText =
      (fixed || adjustedColumnIndex !== columns.length - rightSideColumns) ? (
        columns[adjustedColumnIndex].fields.map((fld, fldidx) => {
          let cellAligntClass =
            fld.alignment === 'RIGHT'
              ? styles.DataCellRight
              : fld.alignment === 'CENTER'
              ? styles.DataCellCenter
              : styles.DataCellLeft;
          return (rs.isFiltered() || (rs.foundRows && rs.foundRows[rowIndex])) ? (
            <span key={fldidx} className={cellAligntClass}>
              {rs.splitMatched(rowIndex, fld.fieldName).map((s, idx) =>
                s.matchFilter || s.foundIdx ? (
                  <span
                    key={idx}
                    className={cn({ FilterMatchedHighlight: s.matchFilter, SearchMatchedHighlight: s.foundIdx })}
                  >
                    {s.str}
                  </span>
                ) : (
                  s.str
                )
              )}
              {groupRecCount}
            </span>
          ) : groupRecCount ? (
            <span key={fldidx} className={cellAligntClass}>
              {rs.getString(fld.fieldName, rowIndex, '')}
              {groupRecCount}
            </span>
          ) :
            rs.getString(fld.fieldName, rowIndex, '')
        })
      ) : (
        <span className={cn(styles.CellColumn, textClass)} />
      );

    const checkMark =
      (rowState === TRowState.Normal) && selectRows && !adjustedColumnIndex ? (
        <div
          className={styles.CellMarkArea}
          onClick={e => {
            e.stopPropagation();
            onSelectRow({
              ref: this,
              rs,
              idx: rowIndex,
              selected: rs.allRowsSelected ? false : !rs.selectedRows[rowIndex]
            });
          }}
        >
          {rs.allRowsSelected || rs.selectedRows[rowIndex] ? '☑' : '☐'}
        </div>
      ) : (
        undefined
      );

    const groupTriangle =
      groupHeader && rowData.group && adjustedColumnIndex === rowData.group.level ? (
        <div
          className={styles.CellMarkArea}
          onClick={e => {
            e.stopPropagation();
            onToggleGroup({ref: this, rs, rowIdx: rowIndex});
          }}
        >
          {rowData.type === TRowType.HeaderCollapsed ? '▷' : '▽'}
        </div>
      ) : (
        undefined
      );

    const cellClassDiv = cn(fixed ? styles.FixedCell : '', styles.DataCellLeft);

    if (checkMark || groupTriangle) {
      return (
        <div
          className={cn(backgroundClass, borderClass, styles.CellRow)}
          key={key}
          style={style}
          onClick={() => {
            onSetCursorPos({ref: this, rs, cursorCol: adjustedColumnIndex, cursorRow: rowIndex});
          }}
        >
          {checkMark}
          {groupTriangle}
          <div className={cn(styles.CellColumn, cellClassDiv, textClass)}>{cellText}</div>
        </div>
      );
    } else {
      return (
        <div
          className={
            footer
              ? cn(styles.CellColumn, styles.FooterCell)
              : cn(backgroundClass, borderClass, styles.CellColumn, cellClassDiv, textClass)
          }
          key={key}
          style={style}
          onClick={ () => onSetCursorPos({ref: this, rs, cursorCol: adjustedColumnIndex, cursorRow: rowIndex}) }
        >
          {cellText}
        </div>
      );
    }
  };

  private _getFooterCellRenderer = (adjustFunc: AdjustColumnIndexFunc, fixed: boolean) => ({
    columnIndex,
    key,
    style
  }: GridCellProps) => {
    const { rs, columns, rightSideColumns, leftSideColumns } = this.props;
    const column = columns[adjustFunc(columnIndex)];
    const classNames = cn(styles.CellColumn, styles.FooterCell, fixed ? styles.FixedCell : '');
    const cellText =
      fixed || columns.length - rightSideColumns - leftSideColumns !== columnIndex
        ? column.fields.map((f, idx) => {
            let classNameSpan =
              f.alignment === 'RIGHT'
                ? styles.DataCellRight
                : f.alignment === 'CENTER'
                ? styles.DataCellCenter
                : styles.DataCellLeft;
            let fieldName = f.fieldName;
            let aggregates = rs.aggregates;
            return (
              <span key={idx} className={classNameSpan}>
                {aggregates ? (aggregates[fieldName] ? aggregates[fieldName] : undefined) : undefined}
              </span>
            );
          })
        : '';

    return (
      <div className={classNames} key={key} style={style}>
        {cellText}
      </div>
    );
  };

  private _getColumnMeasurer = (adjustFunc: AdjustColumnIndexFunc, fixed: boolean) => ({
    index
  }: {
    index: number;
  }): number => {
    const { columns, rightSideColumns } = this.props;
    const { columnWidth } = this.state;
    const adjustedIndex = adjustFunc(index);
    return !fixed && (columns.length - rightSideColumns === adjustedIndex) ? this._deltaWidth
      : columns[adjustedIndex] && columns[adjustedIndex].width ? columns[adjustedIndex].width!
      : columnWidth;
  };

  private _isRowLoaded = ({ index }: Index) => {
    return this.props.rs.status === TStatus.FULL
      || this.props.rs.status === TStatus.ERROR
      || index < this.props.rs.size;
  };
}
