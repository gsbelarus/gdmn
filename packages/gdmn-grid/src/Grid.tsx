import React, { Component } from 'react';
import { ScrollSync, Grid, GridCellProps, AutoSizer, ScrollSyncChildProps } from 'react-virtualized';
import './Grid.css';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';
import cn from 'classnames';
import Draggable, { DraggableCore, DraggableEventHandler } from "react-draggable";
import { RecordSet } from 'gdmn-recordset';
import GDMNSortDialog from './SortDialog';
import { SortFields, TSortOrder, FieldDefs } from 'gdmn-recordset';

const MIN_GRID_COLUMN_WIDTH = 20;

export interface IColumn {
  name: string;
  caption?: string;
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
  CurrentCell: 'CurrentCell',
  CurrentRow: 'CurrentRow',
  EvenRow: 'EvenRow',
  OddRow: 'OddRow',
  SelectedRow: 'SelectedRow',
  Cell: 'Cell',
  OuterCell: 'OuterCell',
  CellMarkArea: 'CellMarkArea',
  HeaderCell: 'HeaderCell',
  FooterCell: 'FooterCell',
  LeftSideCell: 'LeftSideCell',
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
  DragHandleIcon: 'DragHandleIcon'
};

export function visibleToIndex(columns: Columns, visibleIndex: number) {
  let vi = -1;
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].hidden) vi++;

    if (vi === visibleIndex) return i;
  }
  throw new Error(`Invalid visible column index ${visibleIndex}`);
};

/*

interface ISubString {
  str: string;
  matchFilter: boolean;
};

function splitString(s: string, filter: RegExp): ISubString[] {
  const res: ISubString[] = [];
  for( let m = filter.exec(s); m !== null; m = filter.exec(m.input.substr(filter.lastIndex)) ) {
    if (m.index) {
      res.push({ str: m.input.substr(0, m.index - 1), matchFilter: false });
    }
    res.push({ str: m.input.substr(m.index, m[0].length), matchFilter: true });
  }
  const l = res.reduce( (p, s) => p + s.str.length, 0);
  if (l < s.length) {
    res.push({ str: s.substr(s.length - l), matchFilter: false });
  }
  return res;
};

*/

type JSXElementOrString = JSX.Element | string;

function highlightFiltered(s: string, filter: RegExp): JSXElementOrString | string {
  const res: JSXElementOrString[] = [];
  let l = 0;
  let m = filter.exec(s);
  while(m !== null) {
    if (m.index) {
      res.push(m.input.substr(0, m.index));
      l = l + m.index;
    }
    res.push(
      <span key={l} className="FilterMatchedHighlight">
        {m.input.substr(m.index, m[0].length)}
      </span>
    );
    l = l + m[0].length;
    m = filter.exec(m.input.substr(m.index + m[0].length));
  }
  if (res.length) {
    if (l < s.length) {
      res.push(s.substr(l));
    }
    return (<span>{res}</span>);
  } else {
    return s;
  }
};

type AdjustColumnIndexFunc = (gridColumnIndex: number) => number;

export type ScrollIntoView = (recordIndex: number) => void;

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

    this.state = {
      columnWidth: 125,
      overscanColumnCount: 5,
      overscanRowCount: 20,
      rowHeight: 22,
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

  public scrollIntoView: ScrollIntoView = (recordIndex: number = -1) => {
    if (this._scrollIntoView) {
      this._scrollIntoView(recordIndex);
    }
  }

  private _setScrollIntoView = (
    cWidth: number,
    cHeight: number,
    sWidth: number,
    sHeight: number,
    scrollSyncProps: ScrollSyncChildProps
  ) => {
    this._scrollIntoView = (recordIndex: number) => {

      const { rs } = this.props;
      const { rowHeight } = this.state;
      const clientWidth = scrollSyncProps.clientWidth || cWidth;
      const clientHeight = scrollSyncProps.clientHeight || cHeight;
      const scrollWidth = scrollSyncProps.scrollWidth || sWidth;
      const scrollHeight = scrollSyncProps.scrollHeight || sHeight;
      const { scrollTop, scrollLeft } = scrollSyncProps;
      const ri = recordIndex < 0 ? rs.currentRow : recordIndex;
      const rTop = ri * rowHeight;

      let newScrollTop: number;

      if (!clientHeight) {
        return;
      }

      if (rTop >= scrollTop && rTop <= scrollTop + clientHeight - rowHeight) {
        return;
      }

      if (rTop <= clientHeight - rowHeight) {
        newScrollTop = 0;
      }
      else if (scrollHeight - rTop <= clientHeight) {
        newScrollTop = scrollHeight - clientHeight;
      }
      else {
        newScrollTop = rTop - Math.floor((clientHeight - rowHeight) / 2);
      }

      scrollSyncProps.onScroll({
        clientHeight,
        clientWidth,
        scrollHeight,
        scrollLeft,
        scrollTop: newScrollTop,
        scrollWidth
      });
    };
  }

  public render() {
    const { columns, rs, leftSideColumns, rightSideColumns, hideHeader, hideFooter,
      sortDialog, onCancelSortDialog, onApplySortDialog } = this.props;
    const { rowHeight, overscanColumnCount, overscanRowCount } = this.state;

    if (!rs) return <div>No data!</div>;

    const rowCount = rs.data.size;
    const columnCount = columns.length;

    if (!columnCount) return undefined;

    const getLeftSideColumnWidth = this._getColumnMeasurer(this._adjustLeftSideColumnIndex);
    const getBodyColumnWidth = this._getColumnMeasurer(this._adjustBodyColumnIndex);
    const getRightSideColumnWidth = this._getColumnMeasurer(this._adjustRightSideColumnIndex);

    let leftSideColumnsWidth = 0;
    for (let index = 0; index < leftSideColumns; index++) {
      leftSideColumnsWidth += getLeftSideColumnWidth({index});
    }

    let rightSideColumnsWidth = 0;
    for (let index = 0; index < rightSideColumns; index++) {
      rightSideColumnsWidth += getRightSideColumnWidth({index});
    }

    const bodyColumns = columnCount - leftSideColumns - rightSideColumns;
    let bodyColumnsWidth = 0;
    for (let index = 0; index < bodyColumns; index++) {
      bodyColumnsWidth += getBodyColumnWidth({index});
    }

    const scrollBarHeight = scrollbarSize();
    const scrollBarHeightFooter = hideFooter ? scrollBarHeight : 0;
    const headerHeight = hideHeader ? 0 : rowHeight;
    const footerHeight = hideFooter ? 0 : rowHeight + scrollBarHeight;

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

    const leftSideRows = (height: number, scrollTop: number) =>
      <div className={styles.SideRows}>
        <Grid
          overscanRowCount={overscanRowCount}
          cellRenderer={this._getRowsCellRenderer(this._adjustLeftSideColumnIndex, true)}
          columnWidth={getLeftSideColumnWidth}
          columnCount={leftSideColumns}
          className={styles.LeftSideGrid}
          height={height - headerHeight - footerHeight - scrollBarHeightFooter}
          rowHeight={rowHeight}
          rowCount={rowCount}
          scrollTop={scrollTop}
          width={leftSideColumnsWidth}
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
          height: scrollBarHeight
        }}
      >
        <div className={cn(styles.Cell, styles.RightSideCellFooter, styles.LeftSideCellFooter)}></div>
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

    const leftSide = (height: number, scrollTop: number) => !leftSideColumns ? undefined :
      <div className={styles.SideContainer}>
        {leftSideHeader()}
        {leftSideRows(height, scrollTop)}
        {leftSideFooter()}
      </div>;

    const bodyHeader = (width: number, scrollLeft: number) =>
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
          width={width - (rightSideColumns ? 0 : scrollbarSize())}
          ref={ g => g && (this._bodyHeaderGrid = g) }
        />
        {
          rightSideColumns ? undefined :
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: scrollbarSize(),
              height: headerHeight
            }}
          >
            <div className={cn(styles.Cell, styles.HeaderCell)}></div>
          </div>
        }
      </div>;

    const bodyRows = (width: number, height: number, scrollSyncProps: ScrollSyncChildProps) =>
      <div
        className={styles.BodyRows}
        onWheel={ !rightSideColumns ? undefined : e => {
          onScrollWheel(e, width, height, scrollSyncProps);
       }}
      >
        <Grid
          className={cn(styles.BodyGrid,
            rightSideColumns ?  styles.BodyGridNoVScroll : styles.BodyGridVScroll,
            !hideFooter ?  styles.BodyGridNoHScroll : styles.BodyGridHScroll)}
          columnWidth={getBodyColumnWidth}
          columnCount={bodyColumns}
          height={height - headerHeight - footerHeight}
          overscanColumnCount={overscanColumnCount}
          overscanRowCount={overscanRowCount}
          cellRenderer={this._getRowsCellRenderer(this._adjustBodyColumnIndex, false)}
          rowHeight={rowHeight}
          rowCount={rowCount}
          width={width}
          onScroll={ !rightSideColumns || hideFooter ? scrollSyncProps.onScroll : undefined }
          scrollLeft={scrollSyncProps.scrollLeft}
          scrollTop={scrollSyncProps.scrollTop}
          ref={
            g => {
              if (g) {
                this._bodyRowsGrid = g;
                this._setScrollIntoView(
                  width,
                  height ? height - headerHeight - footerHeight : 0,
                  bodyColumnsWidth,
                  rs.data.size * rowHeight,
                  scrollSyncProps);
              }
            }
          }
        />
      </div>;

    const bodyFooter = (width: number, scrollSyncProps: ScrollSyncChildProps) =>
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
          scrollLeft={scrollSyncProps.scrollLeft}
          width={width - (rightSideColumns ? 0 : scrollbarSize())}
          onScroll={ params => scrollSyncProps.onScroll({
            clientHeight: scrollSyncProps.clientHeight,
            clientWidth: scrollSyncProps.clientWidth,
            scrollHeight: scrollSyncProps.scrollHeight,
            scrollLeft: params.scrollLeft,
            scrollTop: scrollSyncProps.scrollTop,
            scrollWidth: scrollSyncProps.scrollWidth
          }) }
          ref={ g => g && (this._bodyFooterGrid = g) }
        />
      </div>;

    const body = (width: number, height: number, scrollSyncProps: ScrollSyncChildProps) => {
      const bodyWidth = width - leftSideColumnsWidth - rightSideColumnsWidth;
      return (
        <div className={styles.BodyContainer}>
          {bodyHeader(bodyWidth, scrollSyncProps.scrollLeft)}
          {bodyRows(bodyWidth, height, scrollSyncProps)}
          {bodyFooter(bodyWidth, scrollSyncProps)}
        </div>
      );
    }

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

    const rightSideRows = (height: number, scrollSyncProps: ScrollSyncChildProps) =>
      <div className={styles.SideRows}>
        <Grid
          overscanRowCount={overscanRowCount}
          cellRenderer={this._getRowsCellRenderer(this._adjustRightSideColumnIndex, true)}
          columnWidth={getRightSideColumnWidth}
          columnCount={rightSideColumns}
          className={styles.RightSideGrid}
          height={height - headerHeight - footerHeight  - scrollBarHeightFooter}
          rowHeight={rowHeight}
          rowCount={rowCount}
          scrollTop={scrollSyncProps.scrollTop}
          width={rightSideColumnsWidth}
          onScroll={ params => scrollSyncProps.onScroll({
            clientHeight: scrollSyncProps.clientHeight,
            clientWidth: scrollSyncProps.clientWidth,
            scrollHeight: scrollSyncProps.scrollHeight,
            scrollLeft: scrollSyncProps.scrollLeft,
            scrollTop: params.scrollTop,
            scrollWidth: scrollSyncProps.scrollWidth
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
            width: rightSideColumnsWidth-1,
            height: scrollBarHeight
          }}
        >
          <div className={cn(styles.Cell, styles.RightSideCellFooter)}></div>
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

    const rightSide = (height: number, scrollSyncProps: ScrollSyncChildProps) => !rightSideColumns ? undefined :
      <div className={styles.SideContainer}>
        {rightSideHeader()}
        {rightSideRows(height, scrollSyncProps)}
        {rightSideFooter()}
      </div>;

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, width: number, height: number, scrollSyncProps: ScrollSyncChildProps) => {
      const {
        onSetCursorPos,
        rs,
        currentCol
      } = this.props;
      const currentRow = rs.currentRow;

      let newCol = currentCol;
      let newRow = currentRow;

      const {
        scrollLeft,
        scrollTop,
        onScroll
      } = scrollSyncProps;

      const clientHeight = height - headerHeight - footerHeight;
      const clientWidth = width - leftSideColumnsWidth - rightSideColumnsWidth;
      const scrollHeight = rs.data.size * rowHeight;
      const clientCountRows = Math.floor(clientHeight/rowHeight);
      const clientBottomRow =  Math.floor((scrollTop + clientHeight)/rowHeight);

      switch (e.key) {
        case 'ArrowDown':
          if (currentRow < (rs.data.size - 1)) newRow = currentRow + 1;
          break;

        case 'ArrowUp':
          if (currentRow > 0) newRow = currentRow - 1;
          break;

        case 'ArrowLeft':
          if (currentCol > leftSideColumns) newCol = currentCol - 1;
          break;

        case 'ArrowRight':
          if (currentCol < (columns.length - rightSideColumns - 1)) newCol = currentCol + 1;
          break;

        case 'PageDown':
          if (currentRow < (rs.data.size - 1))
            newRow = currentRow > rs.data.size - 1 - clientCountRows ? rs.data.size - 1  : clientBottomRow + (currentRow == clientBottomRow ? clientCountRows : 0)
          break;

        case 'PageUp':
          if (currentRow > 0)
            newRow = currentRow == rs.data.size ? rs.data.size - 1 : currentRow < clientCountRows ? 1 : scrollTop == rowHeight*currentRow  ? currentRow - clientCountRows : Math.floor(scrollTop/rowHeight);
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
      else if (newCellBottom > scrollTop + clientHeight) {
        offsetTop = newCellBottom - scrollTop - clientHeight;
      }

      let offsetLeft = 0;

      if (newCellLeft < scrollLeft) {
        offsetLeft = newCellLeft - scrollLeft;
      }
      else if (newCellRight > scrollLeft + clientWidth) {
        offsetLeft = newCellRight - scrollLeft - clientWidth;
      }

      onSetCursorPos(newCol, newRow);

      if (offsetTop || offsetLeft) {
        onScroll({
          clientHeight,
          clientWidth: width,
          scrollHeight,
          scrollLeft: scrollLeft + offsetLeft,
          scrollTop: scrollTop + offsetTop,
          scrollWidth: bodyColumnsWidth
        });
      }
    };

    const onScrollWheel = (e: React.WheelEvent<HTMLDivElement>, width: number,  height: number, scrollSyncProps: ScrollSyncChildProps) => {
      const { scrollLeft, scrollTop, onScroll } = scrollSyncProps;
      const { onSetCursorPos, rs, currentCol } = this.props;
      const currentRow = rs.currentRow;
      const clientHeight = height - headerHeight - footerHeight;
      const scrollHeight = rs.data.size * rowHeight + scrollBarHeightFooter;

      let newCol = currentCol;
      let newRow = currentRow;

      let offsetTop = 0;

      let newscrollTop = e.deltaY < 0 ? Math.max(0, scrollTop + (e.altKey ? 1 : e.deltaY) * rowHeight )
      : Math.min(scrollHeight - clientHeight, scrollTop + (e.altKey ? 1 : e.deltaY) * rowHeight);

      if (e.altKey) {
        if (e.deltaY > 0) {
          if (currentRow < rs.data.size - 1)
            newRow = currentRow + 1
        } else
        if  (currentRow > 0)
          newRow = currentRow - 1;

        const newCellTop = newRow * rowHeight;
        const newCellBottom = newCellTop + rowHeight - 1;

        if (newCellTop < scrollTop) {
          offsetTop = newCellTop - scrollTop;
        }
        else if (newCellBottom > scrollTop + clientHeight) {
          offsetTop = newCellBottom - scrollTop - clientHeight;
        }
        onSetCursorPos(newCol, newRow);
        newscrollTop = scrollTop + offsetTop;
      }

      if (offsetTop || !e.altKey) {
        onScroll({
          clientHeight,
          clientWidth: width,
          scrollHeight,
          scrollLeft,
          scrollTop: newscrollTop,
          scrollWidth: bodyColumnsWidth
        })
      }
    };

    return (
      <div className="GridBody">
        <AutoSizer>
          {
            ({ width, height }) => (
              <ScrollSync>
                {
                  scrollSyncProps => {
                    return (
                      <div
                        className={styles.GridContainer}
                        onKeyDown={ e => onKeyDown(e, width, height - scrollBarHeightFooter, scrollSyncProps) }
                      >
                        {leftSide(height, scrollSyncProps.scrollTop)}
                        {body(width, height, scrollSyncProps)}
                        {rightSide(height, scrollSyncProps)}
                      </div>
                    );
                  }
                }
              </ScrollSync>
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

  private _getColumnLabel = (columnIndex: number): string => {
    const { columns } = this.props;
    const column = columns[columnIndex];
    return column ? column.caption || column.fields[0].caption || column.fields[0].fieldName
      : '';
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
          styles.OuterCell,
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
                rs.allRowsSelected || selectedRowsCount === rs.data.size ? '☑'
                : selectedRowsCount ? '☒'
                : '☐'
              }
            </div>
            <div className={styles.Cell}>
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
                {this._getColumnLabel(adjustedColumnIndex)}
              </div>
            </div>
            {draggableCore}
          </div>;
      } else {
        const classNames = cn(
          styles.Cell,
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
              {this._getColumnLabel(adjustedColumnIndex)}
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
      const { columns, rs, currentCol, onSetCursorPos, selectRows, onSelectRow } = this.props;
      const filter = rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';
      const currentRow = rs.currentRow;
      const adjustedColumnIndex = adjustFunc(columnIndex);
      const rowClass = fixed ? ''
        : currentRow === rowIndex && adjustedColumnIndex === currentCol ? styles.CurrentCell
        : currentRow === rowIndex ? styles.CurrentRow
        : rs.allRowsSelected || rs.selectedRows[rowIndex] ? styles.SelectedRow
        : rowIndex % 2 === 0 ? styles.EvenRow
        : styles.OddRow;
      const cellText = filter ?
        highlightFiltered(rs.data.get(rowIndex)[columns[adjustedColumnIndex].fields[0].fieldName]!.toString(), RegExp(filter, 'i'))
        :
        rs.data.get(rowIndex)[columns[adjustedColumnIndex].fields[0].fieldName];

      if (selectRows && !adjustedColumnIndex) {
        const classNames = cn(
          rowClass,
          styles.OuterCell,
          fixed ? styles.LeftSideCell : styles.DataCell,
        );

        return (
          <div
            className={classNames}
            key={key}
            style={style}
            onClick={ () => onSetCursorPos(adjustedColumnIndex, rowIndex) }
          >
            <div
              className={styles.CellMarkArea}
              onClick={
                (e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  onSelectRow(rowIndex, rs.allRowsSelected ? false : !rs.selectedRows[rowIndex]);
                }
              }
            >
              {rs.allRowsSelected || rs.selectedRows[rowIndex] ? '☑' : '☐'}
            </div>
            <div className={styles.Cell}>
              {cellText}
            </div>
          </div>
        );
      } else {
        const classNames = cn(
          rowClass,
          styles.Cell,
          fixed ? styles.LeftSideCell : styles.DataCell
        );

        return (
          <div
            className={classNames}
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
      const classNames = cn(styles.Cell, styles.FooterCell);

      return (
        <div
          className={classNames}
          key={key}
          style={style}
        >
          {this._getColumnLabel(adjustFunc(columnIndex))}
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

