import React, { Component } from 'react';
import { Grid, GridCellProps, AutoSizer } from 'react-virtualized';
import './Grid.css';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';
import cn from 'classnames';
import Draggable, { DraggableCore, DraggableEventHandler } from "react-draggable";
import { RecordSet, TRowType } from 'gdmn-recordset';
import GDMNSortDialog from './SortDialog';
import { SortFields, TSortOrder, FieldDefs } from 'gdmn-recordset';
import { SyncScroll, OnScroll } from './SyncScroll';

const MIN_GRID_COLUMN_WIDTH = 20;

export interface IColumn {
  name: string;
  caption?: string[];
  fields: FieldDefs;
  hidden?: boolean;
  width?: number;
};

export type Columns = IColumn[];

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
  onCancelSortDialog: () => void,
  onApplySortDialog: (sortFields: SortFields) => void,
  onColumnResize: (columnIndex: number, newWidth: number) => void;
  onColumnMove: (oldIndex: number, newIndex: number) => void;
  onSetCursorPos: (cursorCol: number, cursorRow: number) => void;
  onSort: (rs: RecordSet, sortFields: SortFields) => void;
  onSelectRow: (idx: number, selected: boolean) => void;
  onSelectAllRows: (value: boolean) => void;
  onToggleGroup: (rowIdx: number) => void;
};

export interface IGridState {
  columnWidth: number,
  rowHeight: number,
  overscanColumnCount: number,
  overscanRowCount: number,
  columnBeingResized: boolean
};

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
  DataCell: 'DataCell',
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
  BorderRightBottom: 'BorderRightBottom',
  FixedBorder: 'FixedBorder',
  BlackText: 'BlackText',
  GrayText: 'GrayText'
};

export function visibleToIndex(columns: Columns, visibleIndex: number) {
  let vi = -1;
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].hidden) vi++;

    if (vi === visibleIndex) return i;
  }
  throw new Error(`Invalid visible column index ${visibleIndex}`);
};

type AdjustColumnIndexFunc = (gridColumnIndex: number) => number;

export type ScrollIntoView = (recordIndex: number, columnIndex?: number) => void;

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

  constructor(props: IGridProps) {
    super(props);
    const maxCountFieldInCell = props.columns.reduce( (max, c) => c.fields.length > max ? c.fields.length : max, 0);
    const inCellRowHeight = 18;
    const totalCellVertPadding = 2;
    this.state = {
      columnWidth: 125,
      overscanColumnCount: 5,
      overscanRowCount: 20,
      rowHeight: maxCountFieldInCell === 1 ? inCellRowHeight + totalCellVertPadding 
      : maxCountFieldInCell * inCellRowHeight + totalCellVertPadding,
      columnBeingResized: false
    };
  }

  public shouldComponentUpdate(nextProps: Readonly<IGridProps>, nextState: Readonly<IGridState>, _nextContext: any): boolean {
    const changed: boolean =
      //nextProps.columns.size !== this.props.columns.size
      //||
      //nextProps.leftSideColumns !== this.props.leftSideColumns
      //||
      //nextProps.rightSideColumns !== this.props.rightSideColumns
      //||
      //nextProps.currentCol !== this.props.currentCol
      //||
      //nextProps.rs.currentRow !== this.props.rs.currentRow
      //||
      //nextProps.selectedRows !== this.props.selectedRows
      //||
      //nextProps.rs.size < this.props.rs.size
      //||
      (
        !!this.props.columns.find(
          (c, idx) => nextProps.columns[idx] && (
              typeof c.width !== typeof nextProps.columns[idx].width
              ||
              c.width !== nextProps.columns[idx].width
              ||
              c.name !== nextProps.columns[idx].name
            )
        )
      )
      ||
      this.state.columnBeingResized !== nextState.columnBeingResized
      ;

    const recompute = (g: Grid | undefined) => { if (g) g.recomputeGridSize(); }

    if (changed) {
      recompute(this._leftSideHeaderGrid);
      recompute(this._leftSideRowsGrid);
      recompute(this._leftSideFooterGrid);
      recompute(this._bodyHeaderGrid);
      recompute(this._bodyRowsGrid);
      recompute(this._bodyFooterGrid);
      recompute(this._rightSideHeaderGrid);
      recompute(this._rightSideRowsGrid);
      recompute(this._rightSideFooterGrid);
    };

    return true;
  }

  public componentWillUnmount() {
    this._scrollIntoView = undefined;
  }

  public scrollIntoView: ScrollIntoView = (recordIndex: number = -1, columnIndex?: number) => {
    if (this._scrollIntoView) {
      this._scrollIntoView(recordIndex, columnIndex);
    }
  }

  public render() {
    const { columns, rs, leftSideColumns, rightSideColumns, hideHeader, hideFooter,
      sortDialog, onCancelSortDialog, onApplySortDialog, onSetCursorPos, currentCol } = this.props;
    const { rowHeight, overscanColumnCount, overscanRowCount } = this.state;

    
    if (!rs) return <div>No data!</div>;

    const columnCount = columns.length;

    if (!columnCount) return undefined;

    const composeGrid = (width: number, height: number, scrollLeft: number, sTop: number, onScroll: OnScroll) => {
      const getLeftSideColumnWidth = this._getColumnMeasurer(this._adjustLeftSideColumnIndex);
      const getBodyColumnWidth = this._getColumnMeasurer(this._adjustBodyColumnIndex);
      const getRightSideColumnWidth = this._getColumnMeasurer(this._adjustRightSideColumnIndex);

      let leftSideColumnsWidth = 0;
      for (let index = 0; index < leftSideColumns; index++) {
        leftSideColumnsWidth += getLeftSideColumnWidth({index});
      }

      const sbSize = scrollbarSize();

      let rightSideColumnsWidth = 0;
      for (let index = 0; index < rightSideColumns; index++) {
        rightSideColumnsWidth += getRightSideColumnWidth({index});
      }
      const rightSideWidth = rightSideColumnsWidth ? rightSideColumnsWidth + sbSize : 0;

      const bodyColumns = columnCount - leftSideColumns - rightSideColumns;

      const rowCount = rs.size;
      const scrollHeight = rowCount * rowHeight;
      const currentRow = rs.currentRow;

      const headerHeight = hideHeader ? 0 : rowHeight;
      const footerHeight = hideFooter ? 0 : rowHeight + sbSize;

      const bodyHeight = height - headerHeight - footerHeight;
      const bodyWidth = width - leftSideColumnsWidth - rightSideWidth;
      const bodyColumnsWidth = rightSideColumns ? bodyWidth
      : bodyWidth <= sbSize ? 0
      : bodyWidth - sbSize;

      const scrollTop = scrollHeight <= bodyHeight ? 0
      : sTop >= scrollHeight - rowHeight ? scrollHeight - bodyHeight
      : sTop;

      const bodyCountRows = Math.floor(bodyHeight / rowHeight);
      const bodyBottomRow =  Math.floor((scrollTop + bodyHeight) / rowHeight);

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
          }
          else if (scrollHeight - rTop <= bodyHeight) {
            newScrollTop = scrollHeight - bodyHeight;
          }
          else {
            newScrollTop = rTop - Math.floor((bodyHeight - rowHeight) / 2);
          }
        }

        let newScrollLeft = scrollLeft;

        if (typeof columnIndex === 'number') {
          const bodyColumnIndex = columnIndex - leftSideColumns;

          if (bodyColumnIndex >= 0 && bodyColumnIndex < bodyColumns) {
            const cellWidth = getBodyColumnWidth({index: bodyColumnIndex});

            let cellLeft = 0;
            for (let index = 0; index <= bodyColumnIndex; index++) {
              cellLeft += getBodyColumnWidth({index});
            }

            if (cellLeft < scrollLeft) {
              newScrollLeft = cellLeft;
            }
            else if (cellLeft >= scrollLeft + bodyWidth - cellWidth) {
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
            if (currentRow < rowCount - 1) newRow = currentRow + 1;
            break;

          case 'ArrowUp':
            if (currentRow > 0) newRow = currentRow - 1;
            break;

          case 'ArrowLeft':
            if (currentCol > leftSideColumns) newCol = currentCol - 1;
            break;

          case 'ArrowRight':
            if (currentCol < columns.length - rightSideColumns - 1) newCol = currentCol + 1;
            break;

          case 'PageDown':
            if (currentRow < rowCount - 1)
              newRow = currentRow > rowCount - 1 - bodyCountRows ? rowCount - 1
              : bodyBottomRow + (currentRow === bodyBottomRow ? bodyCountRows : 0)
            break;

          case 'PageUp':
            if (currentRow > 0)
              newRow = currentRow === rowCount ? rowCount - 1
              : currentRow < bodyCountRows ? 1
              : scrollTop === rowHeight * currentRow  ? currentRow - bodyCountRows
              : Math.floor(scrollTop / rowHeight);
            break;

          case 'Home':
            if (currentCol > leftSideColumns) newCol = leftSideColumns;
            break;

          case 'End':
            if (currentCol < (columns.length - rightSideColumns - 1)) newCol = columns.length - rightSideColumns - 1;
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
        }
        else if (newCellBottom > scrollTop + bodyHeight) {
          offsetTop = newCellBottom - scrollTop - bodyHeight;
        }

        let offsetLeft = 0;

        if (newCellLeft < scrollLeft) {
          offsetLeft = newCellLeft - scrollLeft;
        }
        else if (newCellRight > scrollLeft + bodyWidth) {
          offsetLeft = newCellRight - scrollLeft - bodyWidth;
        }

        onSetCursorPos(newCol, newRow);

        console.log(`${offsetTop} - ${offsetLeft}`);

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

        let newscrollTop = e.deltaY < 0 ? Math.max(0, scrollTop + (e.altKey ? 1 : e.deltaY) * rowHeight )
        : Math.min(scrollHeight - bodyHeight, scrollTop + (e.altKey ? 1 : e.deltaY) * rowHeight);

        if (e.altKey) {
          if (e.deltaY > 0) {
            if (currentRow < rowCount - 1)
              newRow = currentRow + 1
          } else {
            if  (currentRow > 0) {
              newRow = currentRow - 1;
            }
          }

          const newCellTop = newRow * rowHeight;
          const newCellBottom = newCellTop + rowHeight - 1;

          if (newCellTop < scrollTop) {
            offsetTop = newCellTop - scrollTop;
          }
          else if (newCellBottom > scrollTop + bodyHeight) {
            offsetTop = newCellBottom - scrollTop - bodyHeight;
          }
          onSetCursorPos(newCol, newRow);
          newscrollTop = scrollTop + offsetTop;
        }

        if (offsetTop || !e.altKey) {
          onScroll({
            scrollLeft,
            scrollTop: newscrollTop
          })
        }
      };

      const leftSide = () => {
        if (!leftSideColumns) return undefined;

        const leftSideHeader = () => hideHeader ? undefined :
          <div className={styles.SideHeader}>
            <Grid
              cellRenderer={this._getHeaderCellRenderer(this._adjustLeftSideColumnIndex, false, leftSideColumns)}
              className={styles.HeaderGrid}
              width={leftSideColumnsWidth}
              height={headerHeight}
              rowHeight={rowHeight}
              columnWidth={getLeftSideColumnWidth}
              rowCount={1}
              columnCount={leftSideColumns}
              ref={ g => g && (this._leftSideHeaderGrid = g) }
            />
          </div>;

        const leftSideRows = () =>
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
              onScroll={ params => onScroll({
                scrollLeft: scrollLeft,
                scrollTop: params.scrollTop
              }) }
              ref={ g => g && (this._leftSideRowsGrid = g) }
            />
          </div>;

        const leftSideFooter = () => hideFooter ?
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: leftSideColumnsWidth,
              height: sbSize
            }}
          >
            <div className={cn(styles.CellColumn, styles.RightSideCellFooter, styles.LeftSideCellFooter)}></div>
          </div>
        :
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
              ref={ g => g && (this._leftSideFooterGrid = g) }
            />
          </div>;

        return (
          <div className={styles.SideContainer}>
            {leftSideHeader()}
            {leftSideRows()}
            {leftSideFooter()}
          </div>
        );
      };

      const body = () => {
        const bodyHeader = () =>
          <div className={styles.BodyHeader}>
            <Grid
              className={styles.HeaderGrid}
              columnWidth={getBodyColumnWidth}
              columnCount={bodyColumns}
              height={headerHeight}
              overscanColumnCount={overscanColumnCount}
              cellRenderer={this._getHeaderCellRenderer(this._adjustBodyColumnIndex, true, bodyColumns)}
              rowHeight={rowHeight}
              rowCount={1}
              scrollLeft={scrollLeft}
              width={bodyColumnsWidth}
              ref={ g => g && (this._bodyHeaderGrid = g) }
            />
            {
              rightSideColumns ? undefined :
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: sbSize,
                  height: headerHeight
                }}
              >
                <div className={cn(styles.CellColumn, styles.HeaderCell)}></div>
              </div>
            }
          </div>;

        const bodyRows = () =>
          <div
            className={styles.BodyRows}
            onWheel={ !rightSideColumns ? undefined : e => {
              onScrollWheel(e);
          }}
          >
            <Grid
              className={cn(styles.BodyGrid,
                rightSideColumns ?  styles.BodyGridNoVScroll : styles.BodyGridVScroll,
                !hideFooter ?  styles.BodyGridNoHScroll : styles.BodyGridHScroll)}
              columnWidth={getBodyColumnWidth}
              columnCount={bodyColumns}
              height={bodyHeight}
              overscanColumnCount={overscanColumnCount}
              overscanRowCount={overscanRowCount}
              cellRenderer={this._getRowsCellRenderer(this._adjustBodyColumnIndex, false)}
              rowHeight={rowHeight}
              rowCount={rowCount}
              width={bodyWidth}
              onScroll={ !rightSideColumns || hideFooter ? ({ scrollLeft, scrollTop }) => onScroll({ scrollLeft, scrollTop }) : undefined }
              scrollLeft={scrollLeft}
              scrollTop={scrollTop}
              ref={
                g => {
                  if (g) {
                    this._bodyRowsGrid = g;
                  }
                }
              }
            />
          </div>;

        const bodyFooter = () =>
          <div className={styles.BodyFooter}>
            <Grid
              className={styles.BodyFooterGrid}
              columnWidth={getBodyColumnWidth}
              columnCount={bodyColumns}
              height={footerHeight}
              overscanColumnCount={overscanColumnCount}
              cellRenderer={this._getFooterCellRenderer(this._adjustBodyColumnIndex, false)}
              rowHeight={rowHeight}
              rowCount={1}
              scrollLeft={scrollLeft}
              width={bodyColumnsWidth}
              onScroll={ params => onScroll({
                scrollLeft: params.scrollLeft,
                scrollTop: scrollTop
              }) }
              ref={ g => g && (this._bodyFooterGrid = g) }
            />
          </div>;

        return (
          <div className={styles.BodyContainer}>
            {bodyHeader()}
            {bodyRows()}
            {bodyFooter()}
          </div>
        );
      };

      const rightSideHeader = () => hideHeader ? undefined :
        <div className={styles.SideHeader}>
          <Grid
            cellRenderer={this._getHeaderCellRenderer(this._adjustRightSideColumnIndex, false, rightSideColumns)}
            className={styles.HeaderGrid}
            width={rightSideColumnsWidth}
            height={headerHeight}
            rowHeight={rowHeight}
            columnWidth={getRightSideColumnWidth}
            rowCount={1}
            columnCount={rightSideColumns}
            ref={ g => g && (this._rightSideHeaderGrid = g) }
          />
        </div>;

      const rightSideRows = () =>
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
            onScroll={ params => onScroll({
              scrollLeft: scrollLeft,
              scrollTop: params.scrollTop
            }) }
            ref={ g => g && (this._rightSideRowsGrid = g) }
          />
        </div>;

      const rightSideFooter = () => hideFooter ?
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
            <div className={cn(styles.CellColumn, styles.RightSideCellFooter)}></div>
          </div>
        </div>
        :
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
            ref={ g => g && (this._rightSideFooterGrid = g) }
          />
        </div>;

      const rightSide = () => {
        if (!rightSideColumns) return undefined;

        return (
          <div className={styles.SideContainer}>
            {rightSideHeader()}
            {rightSideRows()}
            {rightSideFooter()}
          </div>
        );
      };

      return (
        <div
          className={styles.GridContainer}
          onKeyDown={ e => onKeyDown(e) }
        >
          {leftSide()}
          {body()}
          {rightSide()}
        </div>
      );
    }

    return (
      <div className="GridBody">
        <AutoSizer>
          {
            ({ width, height }) => (
              <SyncScroll>
                { ({ scrollLeft, scrollTop, onScroll }) => composeGrid(width, height, scrollLeft, scrollTop, onScroll) }
              </SyncScroll>
            )
          }
        </AutoSizer>
        { sortDialog ?
          <GDMNSortDialog
            fieldDefs={rs.fieldDefs}
            sortFields={rs.sortFields}
            onCancel={onCancelSortDialog}
            onApply={onApplySortDialog}
          /> : undefined }
      </div>
    )
  }

  private _getColumnLabel = (columnIndex: number): string[] => {
    const { columns } = this.props;
    const column = columns[columnIndex];

    if (!column) {
        return [];
    }

    return column.caption || (column.fields.map( f => f.caption ) && []);
  }

  private _adjustLeftSideColumnIndex = (gridColumnIndex: number): number => {
    return gridColumnIndex;
  }

  private _adjustBodyColumnIndex = (gridColumnIndex: number): number => {
    return gridColumnIndex + this.props.leftSideColumns;
  }

  private _adjustRightSideColumnIndex = (gridColumnIndex: number): number => {
    return this.props.columns.length - this.props.rightSideColumns + gridColumnIndex;
  }

  private _getHeaderCellRenderer = (adjustFunc: AdjustColumnIndexFunc, movable: boolean, columnsCount: number) =>
    ({ style, columnIndex, key }: GridCellProps) => {
      const { columnBeingResized } = this.state;
      const { onColumnResize, onSort, columns, rs, selectRows, onSelectAllRows } = this.props;

      const adjustedColumnIndex = adjustFunc(columnIndex);
      const getColumnWidth = this._getColumnMeasurer(adjustFunc);

      const column = columns[adjustedColumnIndex];
      const columnField = column.fields[0];
      const sortField = rs.sortFields.find( sf => sf.fieldName === columnField.fieldName );
      const sortOrder: TSortOrder = !sortField ? 'UNDEFINED' : sortField.asc ? 'ASC' : 'DESC';

      const draggableCore =
        <DraggableCore
          onStart={this._onStartColumnResizing}
          onStop={this._onStopColumnResizing}
          onDrag={(_, { deltaX }) => {
            this._columnSizingDeltaX += deltaX;
            const newWidth = getColumnWidth({ index: columnIndex }) + this._columnSizingDeltaX;
            if (newWidth > MIN_GRID_COLUMN_WIDTH) {
              onColumnResize(adjustedColumnIndex, newWidth);
              this._columnSizingDeltaX = 0;
            }
          }}
        >
          <div className={styles.DragHandleIcon} />
        </DraggableCore>;

      let innerCell: JSX.Element;

      if (selectRows && !adjustedColumnIndex) {
        const classNames = cn(
          styles.CellRow,
          styles.HeaderCell,
          sortOrder === 'ASC' ? styles.GridColumnSortAsc
            : sortOrder === 'DESC' ? styles.GridColumnSortDesc
            : '',
          columnBeingResized ? styles.ResizingColumn : ''
        );

        const selectedRowsCount= rs.selectedRows.reduce( (p, sr) => sr ? p + 1 : p, 0 );

        innerCell =
          <div
            key={key}
            className={classNames}
            style={style}
          >
            <div
              className={styles.CellMarkArea}
              onClick={
                (e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  onSelectAllRows(!rs.allRowsSelected);
                }
              }
            >
              {
                rs.allRowsSelected || selectedRowsCount === rs.size ? '☑'
                : selectedRowsCount ? '☒'
                : '☐'
              }
            </div>
            <div className={styles.CellColumn}>
              <div
                className={styles.CellCaption}
                onClick={
                  () => {
                    if (!this._columnMovingDeltaX && !this._columnSizingDeltaX) {
                      onSort(rs, [ { fieldName: columnField.fieldName, asc: sortOrder !== 'ASC' } ]);
                    }
                  }
                }
              >
                {this._getColumnLabel(adjustedColumnIndex).map( (l, idx) => <span key={idx}>{l}</span> )}
              </div>
            </div>
            {draggableCore}
          </div>;
      } else {
        const classNames = cn(
          styles.CellColumn,
          styles.HeaderCell,
          sortOrder === 'ASC' ? styles.GridColumnSortAsc
            : sortOrder === 'DESC' ? styles.GridColumnSortDesc
            : '',
          columnBeingResized ? styles.ResizingColumn : ''
        );

        innerCell =
          <div
            key={key}
            className={classNames}
            style={style}
          >
            <div
              className="CellCaption"
              onClick={
                () => {
                  if (!this._columnMovingDeltaX && !this._columnSizingDeltaX) {
                    onSort(rs, [ { fieldName: columnField.fieldName, asc: sortOrder !== 'ASC' } ]);
                  }
                }
              }
            >
              {this._getColumnLabel(adjustedColumnIndex).map( (l, idx) => <span key={idx}>{l}</span> )}
            </div>
            {draggableCore}
          </div>;
      }

      if (!movable) return innerCell;

      return (
        <Draggable
          key={key}
          axis="x"
          handle=".CellCaption"
          position={{ x: 0, y: 0 }}
          defaultClassNameDragging={styles.GridColumnDragging}
          onStart={this._onDragColumnStart}
          onDrag={this._onDragColumn}
          onStop={
            () => {
              const { onColumnMove } = this.props;
              if (this._columnMovingDeltaX < 0 && columnIndex > 0) {
                let d = -this._columnMovingDeltaX;
                let ec = columnIndex;
                while (ec > 0 && d > getColumnWidth({ index: ec - 1 }) / 2) {
                  d -= getColumnWidth({ index: --ec });
                }
                if (columnIndex !== ec) {
                  onColumnMove(adjustedColumnIndex, adjustFunc(ec));
                }
              }
              else if (this._columnMovingDeltaX > 0 && columnIndex < columnsCount - 1) {
                let d = this._columnMovingDeltaX;
                let ec = columnIndex;
                while (ec < columnsCount - 1 && d > getColumnWidth({ index: ec + 1 }) / 2) {
                  d -= getColumnWidth({ index: ++ec });
                }
                if (columnIndex !== ec) {
                  onColumnMove(adjustedColumnIndex, adjustFunc(ec));
                }
              }
            }
          }
        >
          {innerCell}
        </Draggable>);
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
    this._columnMovingDeltaX += deltaX
  };

  private _getRowsCellRenderer = (adjustFunc: AdjustColumnIndexFunc, fixed: boolean) =>
    ({columnIndex, key, rowIndex, style}: GridCellProps) => {
      const { columns, rs, currentCol, onSetCursorPos, selectRows, onSelectRow, onToggleGroup } = this.props;
      const currentRow = rs.currentRow;
      const adjustedColumnIndex = adjustFunc(columnIndex);
      const rowData = rs.get(rowIndex);
      const groupHeader = rowData.type === TRowType.HeaderExpanded || rowData.type === TRowType.HeaderCollapsed;
      const footer = rowData.type === TRowType.Footer;

      const backgroundClass = fixed ? styles.FixedBackground
        : currentRow === rowIndex ? (adjustedColumnIndex === currentCol ? styles.CurrentCellBackground : styles.CurrentRowBackground)
        : selectRows && (rs.allRowsSelected || rs.selectedRows[rowIndex]) ? styles.SelectedBackground
        : groupHeader ? styles.GroupHeaderBackground
        : rowIndex % 2 === 0 ? styles.EvenRowBackground
        : styles.OddRowBackground;

      const borderClass = fixed ? styles.FixedBorder
        : groupHeader ? styles.BorderBottom
        : styles.BorderRightBottom;

      const cellClass = fixed ? styles.FixedCell
        : styles.DataCell;

      const textClass = !groupHeader && rowData.group && adjustedColumnIndex <= rowData.group.level ? styles.GrayText
        : styles.BlackText;

      if (groupHeader && rowData.group && adjustedColumnIndex > rowData.group.level) {
        return (
          <div
            className={cn(backgroundClass, borderClass)}
            key={key}
            style={style}
            onClick={ () => onSetCursorPos(adjustedColumnIndex, rowIndex) }
          />
        );
      }

      const groupRecCount = groupHeader && rowData.group && adjustedColumnIndex === rowData.group.level ?
        <sup>
          {rowData.group.bufferCount}
        </sup>
        :
        undefined;

        const cellText = 
          columns[adjustedColumnIndex].fields.map((fld, fldid) => 
            rs.isFiltered() || (rs.foundRows && rs.foundRows[rowIndex]) ?
            <span key={fldid}>
              {rs.splitMatched(rowIndex, fld.fieldName).map(
                (s, idx) => (s.matchFilter || s.foundIdx ?
                  <span
                    key={idx}
                    className={cn({'FilterMatchedHighlight': s.matchFilter, 'SearchMatchedHighlight': s.foundIdx})}
                  >
                    {s.str}
                  </span>
                  :
                  s.str)
              )}
              {groupRecCount}
            </span>
            : groupRecCount ?
            <span key={fldid}>
              {rs.getString(rowIndex, fld.fieldName, '')}
              {groupRecCount}
            </span>
            :           
            <span key={fldid}>                            
              {rs.getString(rowIndex, fld.fieldName, '')}
            </span>
        ) 
            
      const checkMark = selectRows && !adjustedColumnIndex ?
        <div
          className={styles.CellMarkArea}
          onClick={
            e => {
              e.stopPropagation();
              onSelectRow(rowIndex, rs.allRowsSelected ? false : !rs.selectedRows[rowIndex]);
            }
          }
        >
          {rs.allRowsSelected || rs.selectedRows[rowIndex] ? '☑' : '☐'}
        </div>
        :
        undefined;

      const groupTriangle = groupHeader && rowData.group && adjustedColumnIndex === rowData.group.level ?
        <div
          className={styles.CellMarkArea}
          onClick={
            e => {
              e.stopPropagation();
              onToggleGroup(rowIndex);
            }
          }
        >
          {rowData.type === TRowType.HeaderCollapsed ? '▷' : '▽'}
        </div>
        :
        undefined;

      if (checkMark || groupTriangle) {
        return (
          <div
            className={cn(backgroundClass, borderClass, styles.CellRow)}
            key={key}
            style={style}
            onClick={ () => onSetCursorPos(adjustedColumnIndex, rowIndex) }
          >
            {checkMark}
            {groupTriangle}
            <div className={cn(styles.CellColumn, cellClass, textClass)}>
              {cellText}
            </div>
          </div>
        );
      } else {
        return (
          <div
            className={footer? cn(styles.CellColumn, styles.FooterCell) : cn(backgroundClass, borderClass, styles.CellColumn, cellClass, textClass)}
            key={key}
            style={style}
            onClick={ () => onSetCursorPos(adjustedColumnIndex, rowIndex) }
          >
            {cellText}
          </div>
        );
      }
    };

  private _getFooterCellRenderer = (adjustFunc: AdjustColumnIndexFunc, _fixed: boolean) =>
    ({columnIndex, key, style}: GridCellProps) => {
      const classNames = cn(styles.CellColumn, styles.FooterCell);
      const { rs, columns } = this.props;
      const column = columns[adjustFunc(columnIndex)];
      const cellText = column.fields.map( (f, idx) => {
        let fieldName = f.fieldName;
        let aggregates = rs.aggregates;
        return <span key={idx}>{aggregates ? (aggregates[fieldName] ? aggregates[fieldName] : undefined) : undefined}</span>;
      });    

      return (
        <div
          className={classNames}
          key={key}
          style={style}
        >
          {cellText}
        </div>
      );
    };

  private _getColumnMeasurer = (adjustFunc: AdjustColumnIndexFunc) => ({ index }: { index: number}): number => {
    const { columns } = this.props;
    const { columnWidth } = this.state;
    const adjustedIndex = adjustFunc(index);
    return columns[adjustedIndex].width ? columns[adjustedIndex].width || 0 : columnWidth;
  }
};

