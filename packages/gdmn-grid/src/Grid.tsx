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
import scrollbarSize from 'dom-helpers/util/scrollbarSize';
import cn from 'classnames';
import Draggable, { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { FieldDefs, RecordSet, SortFields, TRowType, TSortOrder, TStatus, TRowState, TDataType } from 'gdmn-recordset';
import GDMNSortDialog from './SortDialog';
import { OnScroll, OnScrollParams } from './SyncScroll';
import { TextCellEditor } from './editors/TextCellEditor';
import { ParamsDialog } from './GridParams/ParamsDialog';
import { applyUserSettings } from './applyUserSettings';
import { numberFormats } from 'gdmn-internals';
import { IGridColors, getClassNames, IGridCSSClassNames, IColumnsSettings } from './types';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';

const MIN_GRID_COLUMN_WIDTH = 20;

/**
 * We format display values of number and date types
 * in following order:
 *
 * 1. Use format at Column level, if defined
 * 2. Use format at Recordset level, if defined
 * 3. Use system wide default format values
 *
 * We store column level format values in a fields
 * property of IColumn object. Take care that FieldDef
 * object at column level *must be* a copy
 * and not a reference of a corresponding FieldDef
 * of related RecordSet.
 */

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

export type TRevertColumnsEvent = IGridEvent & {oldColumns: Columns};
export type TCancelSortDialogEvent = IGridEvent;
export type TApplySortDialogEvent = IGridEvent & {sortFields: SortFields};
// export type TColumnResizeEvent = IGridEvent & {columnIndex: number, newWidth: number};
// export type TColumnMoveEvent = IGridEvent & {oldIndex: number, newIndex: number};
export type TSetCursorPosEvent = IGridEvent & {cursorCol: number, cursorRow: number};
export type TSortEvent = IGridEvent & {sortFields: SortFields};
export type TSelectRowEvent = IGridEvent & {idx: number, selected: boolean};
export type TSelectAllRowsEvent = IGridEvent & {value: boolean};
export type TToggleGroupEvent = IGridEvent & {rowIdx: number};
export type TLoadMoreRsDataEvent = IGridEvent & IndexRange;
export type TRecordsetEvent = IGridEvent;
export type TRecordsetSetFieldValue = IGridEvent & {fieldName: string, value: TDataType};

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
  readOnly?: boolean;
  onCancelSortDialog: TEventCallback<TCancelSortDialogEvent>;
  onApplySortDialog: TEventCallback<TApplySortDialogEvent>;
  // onColumnResize: TEventCallback<TColumnResizeEvent>;
  // onColumnMove: TEventCallback<TColumnMoveEvent>;
  onSetCursorPos: TEventCallback<TSetCursorPosEvent>;
  onSort: TEventCallback<TSortEvent>;
  onSelectRow: TEventCallback<TSelectRowEvent>;
  onSelectAllRows: TEventCallback<TSelectAllRowsEvent>;
  onToggleGroup: TEventCallback<TToggleGroupEvent>;
  onInsert: TEventCallback<TRecordsetEvent>;
  onDelete: TEventCallback<TRecordsetEvent>;
  onCancel: TEventCallback<TRecordsetEvent>;
  onSetFieldValue: TEventCallback<TRecordsetSetFieldValue>;
  loadMoreRsData?: TEventCallback<TLoadMoreRsDataEvent, Promise<any>>;
  loadMoreThresholdPages?: number;
  loadMoreMinBatchPagesRatio?: number;
  colors?: IGridColors;
  columnsSettings?: IColumnsSettings;
  onSetColumnsSettings?: (userSettings: IColumnsSettings | undefined ) => void;
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
  fieldEditor: boolean;
  displayColumns: Columns;
  prevColumns: Columns;
  columnsSettings?: IColumnsSettings;
  prevColumnsSettings?: IColumnsSettings;
  deltaWidth: number;
  notificationMessage?: string;
}

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

export function getSettingsWithNewWidth(columns: Columns, columnName: string, columnsSettings: IColumnsSettings | undefined, initialColumnWidth: number, newWidth: number): IColumnsSettings | undefined {
  const selectedColumn = columns.find(c => c.name === columnName);

  if (!selectedColumn) {
    /**
     * Это какая-то ошибка в нашем коде, если мы не нашли колонку по имени
     */
    throw new Error(`Unknown column ${columnName}`);
  }

  const oldWidth = selectedColumn.width ? selectedColumn.width : 0;

  let newColumnSettings = columnsSettings;

  // нет настроек и ничего не надо устанавливать
  if (!newColumnSettings?.columns?.[columnName] && oldWidth === newWidth) {
    //
  }

  // нет настроек, но их надо установить
  else if (!newColumnSettings?.columns?.[columnName] && oldWidth !== newWidth) {
    if (!newColumnSettings) {
      newColumnSettings = {};
    }
    newColumnSettings = {...newColumnSettings, columns: {...newColumnSettings.columns, [columnName]: { width: newWidth }}};
  }

  // есть настройки, но их надо изменить
  else if (newColumnSettings?.columns?.[columnName] && oldWidth !== newWidth && newWidth !== initialColumnWidth) {
    newColumnSettings = {...newColumnSettings, columns: {...newColumnSettings.columns, [columnName]: {...newColumnSettings.columns[columnName], width: newWidth}}};
  }

  // есть настройки, но их можно удалять
  else if (newColumnSettings?.columns?.[columnName] && (newWidth === initialColumnWidth || newWidth === oldWidth)) {
    const { width, ...noWidth } = newColumnSettings.columns[columnName];
    newColumnSettings = {...newColumnSettings, columns: {...newColumnSettings.columns, [columnName]: noWidth}};
  }
  return newColumnSettings;
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
  private _styles: IGridCSSClassNames;
  private _containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private _captureFocus: boolean = false;

  private _onCloseSetParamsDialog = () => {
    this.setState({ showDialogParams: false });
  }

  /**
   * Удаляем пустые объекты в пользовательских настройках формы и сохраняем
   */
  private _updateUserSettings = (userSettings: IColumnsSettings | undefined) => {
    const { onSetColumnsSettings, columns } = this.props;

      if (userSettings) {
        let newSettings: IColumnsSettings | undefined = {};
        //удаляем настройки колонок, которые пустые
        if (userSettings.columns && Object.keys(userSettings.columns).length) {
          const newColumns = Object.entries(userSettings.columns).filter( s => s[1] && Object.keys(s[1]).length);
          if (newColumns.length) {
            newSettings = {columns: Object.fromEntries(newColumns)};
          }
        }
        //если есть order, отличный от начальных данных, записываем в настройки
        if (userSettings.order?.length && JSON.stringify(columns.map(c => c.name)) !== JSON.stringify(userSettings.order)) {
          newSettings = {...newSettings, order: userSettings.order};
        }
        //если есть columns или order, сохраняем настройки
        //иначе - undefined
        if (!Object.keys(newSettings).length)
          newSettings = undefined;
        if (onSetColumnsSettings)
          onSetColumnsSettings(newSettings);
        else
          this.setState({
            ...this.state,
            columnsSettings: newSettings
          })
      }
  }

  public static defaultProps: Partial<IGridProps> = {
    loadMoreRsData: () => Promise.resolve(),
    loadMoreThresholdPages: 2,
    loadMoreMinBatchPagesRatio: 2
  };

  constructor(props: IGridProps) {
    super(props);

    this._styles = getClassNames(props.colors);

    const maxCountFieldInCell = props.columns.reduce((max, c) => (c.fields.length > max ? c.fields.length : max), 0);
    const inCellRowHeight = 18;
    const totalCellVertPadding = 2;

    const newColumns = props.columnsSettings ? applyUserSettings(props.columns, props.columnsSettings) : props.columns;
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
      showDialogParams: false,
      fieldEditor: false,
      displayColumns: newColumns,
      prevColumns: [],
      prevColumnsSettings: undefined,
      deltaWidth: 0,
      columnsSettings: props.columnsSettings
    };
  }
/**
 * При изменении props.columns запишем в state.columns новый объект колонок, учитывая пользовательские настройки,
 * и будем его использовать для отображения в гриде
 * @param props
 * @param state
 */
  static getDerivedStateFromProps(props: IGridProps, state: IGridState) {
    const columnsSettings = props.onSetColumnsSettings ? props.columnsSettings : state.columnsSettings;
    if (state.prevColumns !== props.columns || state.prevColumnsSettings !== columnsSettings) {
      const comboColumns = columnsSettings ? applyUserSettings(props.columns, columnsSettings) : props.columns;
      return {
        ...state,
        displayColumns: comboColumns.filter(c => !c.hidden),
        prevColumns: props.columns,
        prevColumnsSettings: columnsSettings
      }
    }
    return null;
  }

  public shouldComponentUpdate(
    nextProps: Readonly<IGridProps>,
    nextState: Readonly<IGridState>,
    _nextContext: any
  ): boolean {
    const changed: boolean =
      !!this.state.displayColumns.find(
        (c, idx) =>
          nextProps.columns[idx] &&
          (typeof c.width !== typeof nextProps.columns[idx].width ||
            c.width !== nextProps.columns[idx].width ||
            c.name !== nextProps.columns[idx].name)
      ) ||
      this.state.columnBeingResized !== nextState.columnBeingResized ||
      this.state.deltaWidth !== nextState.deltaWidth;

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

  public componentDidUpdate() {
    if (this._captureFocus) {
      this._captureFocus = false;
      if (this._containerRef.current) {
        this._containerRef.current.focus();
      }
    }
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
      currentCol,
      columns,
      onSetColumnsSettings
    } = this.props;
    const { displayColumns, rowHeight, overscanColumnCount, overscanRowCount, showDialogParams, notificationMessage } = this.state;
    const styles = this._styles;

    if (!rs) {
      return <div>No data!</div>;
    }

    const columnCount = displayColumns.length;

    if (!columnCount) {
      return undefined;
    }

    const composeGrid = (width: number, height: number, scrollLeft: number, sTop: number, deltaWidth: number, onScroll: OnScroll) => {
      const getLeftSideColumnWidth = this._getColumnMeasurer(this._adjustLeftSideColumnIndex, true);
      const getBodyColumnWidth = this._getColumnMeasurer(this._adjustBodyColumnIndex, false);
      const getRightSideColumnWidth = this._getColumnMeasurer(this._adjustRightSideColumnIndex, true);
      const styles = this._styles;

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

      const onKeyDown = this.state.fieldEditor ? undefined : (e: React.KeyboardEvent<HTMLDivElement>) => {
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
            if (currentCol < displayColumns.length - rightSideColumns - 1) {
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
            if (currentCol < displayColumns.length - rightSideColumns - 1) {
              newCol = displayColumns.length - rightSideColumns - 1;
            }
            break;

          case 'F10':
            this.setState({ showDialogParams: true });
            break;

          case 'F2': {
            if (!this.props.readOnly && rs.get(currentRow).type === TRowType.Data) {
              this.setState({ fieldEditor: true });
            }
            break;
          }

          case 'Insert': {
            const { onInsert, readOnly } = this.props;
            if (!readOnly) {
              onInsert({ ref: this, rs });
            }
            break;
          }

          case 'Delete': {
            const { onDelete, readOnly } = this.props;
            if (!readOnly && e.ctrlKey && rs.size && rs.get(currentRow).type === TRowType.Data) {
              onDelete({ ref: this, rs });
            }
            break;
          }

          case 'Esc':
          case 'Escape': {
            if (rs.getRowState() === TRowState.Edited || rs.getRowState() === TRowState.Inserted || rs.getRowState() === TRowState.Deleted) {
              const { onCancel } = this.props;
              onCancel({ ref: this, rs });
            }
            break;
          }

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
        /**
         * Для того, чтобы грид грасиво выглядел на экране мы хотим, чтобы
         * колонки заполняли всю отведенную ему ширину. Мы вычисляем разницу,
         * между фактической шириной колонок и шириной места под грид
         * и записываем ее в переменную deltaWidth.
         *
         * Но, если мы просто всегда будем расширять последнюю колонку на
         * недостающую ширину, то в некоторых конфигурациях грида она может
         * стать слишком широкой и это тоже будет некрасиво.
         *
         * Поэтому мы проверяем, если разница больше ширины колонки
         * по-умолчанию, то добавляем еще одну пустую колонку,
         * если меньше -- то прибавляем к ширине последней колонки.
         *
         */
        const columnCountWithFakeColumn = bodyColumns + ((deltaWidth && deltaWidth > this.state.columnWidth) ? 1 : 0)

        const bodyHeader = () => (
          <div className={styles.BodyHeader}>
            <Grid
              className={styles.HeaderGrid}
              columnWidth={getBodyColumnWidth}
              columnCount={columnCountWithFakeColumn}
              height={headerHeight}
              overscanColumnCount={overscanColumnCount}
              cellRenderer={this._getHeaderCellRenderer(
                this._adjustBodyColumnIndex,
                true,
                columnCountWithFakeColumn,
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
                : onScrollWheel
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
                    columnCount={columnCountWithFakeColumn}
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
              columnCount={columnCountWithFakeColumn}
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
        <div
          tabIndex={0}
          className={styles.GridContainer}
          onKeyDown={onKeyDown}
          ref={this._containerRef}
        >
          {leftSide()}
          {body()}
          {rightSide()}
        </div>
      );
    };

    return (
      <div className={styles.GridBody}>
        {
          notificationMessage ?
            <MessageBar
              messageBarType={MessageBarType.warning}
              isMultiline={false}
              onDismiss={ () => this.setState({ notificationMessage: undefined }) }
              dismissButtonAriaLabel="Close"
              overflowButtonAriaLabel="See more"
            >
              {notificationMessage}
            </MessageBar>
          :
            undefined
        }
        <AutoSizer>
          {({ width, height }) => {
            let deltaWidthColumn =
              width -
              displayColumns.reduce((w, c) => (c.width ? w + c.width : w + this.state.columnWidth), 0) -
              scrollbarSize() - 1;

            if (deltaWidthColumn < 0) {
              deltaWidthColumn = 0;
            }

            const { scrollLeft, scrollTop, deltaWidth } = this.state;
            if (deltaWidth !== deltaWidthColumn) {
              setTimeout(() => this.setState({ deltaWidth: deltaWidthColumn }), 0);
            }

            return composeGrid(width, height, scrollLeft, scrollTop, deltaWidthColumn, (params: OnScrollParams) =>
              this.setState({ ...params })
            );
          }}
        </AutoSizer>
        {sortDialog ?
          <GDMNSortDialog
            fieldDefs={rs.fieldDefs}
            sortFields={rs.sortFields}
            onCancel={() => onCancelSortDialog({ref: this, rs})}
            onApply={(sortFields) => onApplySortDialog({ref: this, rs, sortFields})}
          />
        :
          undefined
        }
        {showDialogParams ?
          <ParamsDialog
            onRevert={() => {
              if (onSetColumnsSettings)
                onSetColumnsSettings(undefined)
              else {
                this.setState({
                  ...this.state,
                  columnsSettings: undefined
                })
              };
              this.setState({
                ...this.state,
                displayColumns: columns.filter(c => !c.hidden)
              });
            }}
            onChanged={
              (userSettings: IColumnsSettings | undefined) => {
                this._updateUserSettings(userSettings);
              }}
            onDismiss={this._onCloseSetParamsDialog}
            columns={columns}
            userSettings={onSetColumnsSettings ? this.props.columnsSettings : this.state.columnsSettings}
            initialColumnsWidth={this.state.columnWidth}
          />
        :
          undefined
        }
      </div>
    );
  }

  private _getColumnLabel = (columnIndex: number): string[] => {
    const { displayColumns } = this.state;
    const column = displayColumns[columnIndex];

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
    return this.state.displayColumns.length - this.props.rightSideColumns + gridColumnIndex;
  };

  private _getHeaderCellRenderer = (
    adjustFunc: AdjustColumnIndexFunc,
    movable: boolean,
    columnsCount: number,
    fixed: boolean
  ) => ({ style, columnIndex, key }: GridCellProps) => {
    const { columnBeingResized, displayColumns, deltaWidth } = this.state;
    const {
      onSort,
      rs,
      selectRows,
      onSelectAllRows,
      rightSideColumns,
      leftSideColumns,
      columns,
      onSetColumnsSettings
    } = this.props;
    const styles = this._styles;
    const columnsSettings = onSetColumnsSettings ? this.props.columnsSettings : this.state.columnsSettings;
    const adjustedColumnIndex = adjustFunc(columnIndex);
    const getColumnWidth = this._getColumnMeasurer(adjustFunc, fixed);

    if (fixed || adjustedColumnIndex !== displayColumns.length - rightSideColumns) {
      const column = displayColumns[adjustedColumnIndex];
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
              const columnName = column.name;
              const newUserColumnSettings = getSettingsWithNewWidth(columns, columnName, columnsSettings, this.state.columnWidth, newWidth);
              this._updateUserSettings(newUserColumnSettings);
              this._columnSizingDeltaX = 0;
            }
          }}
        >
          <div className={styles.DragHandleIcon} />
        </DraggableCore>
      );

      let innerCell: JSX.Element;

      const onSortColumnClick = rs.status === TStatus.FULL
        ?
          () => {
            if (!this._columnMovingDeltaX && !this._columnSizingDeltaX) {
              onSort({
                ref: this,
                rs,
                sortFields: [{ fieldName: columnField.fieldName, asc: sortOrder !== 'ASC' }]
              });
            }
          }
        :
          () => {
            this.setState({ notificationMessage: 'Для сортировки необходимо загрузить все данные с сервера.' });
            setTimeout( () => this.setState( state => state.notificationMessage ? {...state, notificationMessage: undefined} : state ), 2000);
          };

      if (selectRows && !adjustedColumnIndex) {
        const classNames = cn(
          styles.CellRow,
          styles.HeaderCell,
          sortOrder !== 'UNDEFINED' ? styles.GridColumnSort : '',
          columnBeingResized ? styles.ResizingColumn : ''
        );

        const selectedRowsCount = rs.selectedRows.reduce((p, sr) => (sr ? p + 1 : p), 0);

        const onSelectAllRowsClick = (e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          onSelectAllRows({ref: this, rs, value: !rs.allRowsSelected});
        };

        innerCell = (
          <div key={key} className={classNames} style={style}>
            <div
              className={styles.CellMarkArea}
              onClick={onSelectAllRowsClick}
            >
              {rs.allRowsSelected || selectedRowsCount === rs.size ? '☑' : selectedRowsCount ? '☒' : '☐'}
            </div>
            <div className={styles.CellColumn}>
              <div
                className={styles.CellCaption}
                onClick={onSortColumnClick}
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
          sortOrder !== 'UNDEFINED' ? styles.GridColumnSort : '',
          columnBeingResized ? styles.ResizingColumn : ''
        );

        const sortIndicator = sortOrder === 'ASC'
          ? <div className={styles.GridColumnSortCode}>{'\u2193'}</div>
          : sortOrder === 'DESC'
          ? <div className={styles.GridColumnSortCode}>{'\u2191'}</div>
          : null;

        innerCell = (
          <div key={key} className={classNames} style={style}>
            {sortIndicator}
            <div
              className={styles.CellCaption}
              onClick={onSortColumnClick}
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
          handle={'.' + styles.CellCaption}
          position={{ x: 0, y: 0 }}
          disabled={this.state.fieldEditor}
          defaultClassNameDragging={styles.GridColumnDragging}
          onStart={this._onDragColumnStart}
          onDrag={this._onDragColumn}
          onStop={() => {
            let change = false;
            let ec = columnIndex;
            if (this._columnMovingDeltaX < 0 && columnIndex > 0) {
              let d = -this._columnMovingDeltaX;
              while (ec > 0 && d > getColumnWidth({ index: ec - 1 }) / 2) {
                d -= getColumnWidth({ index: --ec });
              }
              if (columnIndex !== ec) {
                change = true;
              }
            } else if (this._columnMovingDeltaX > 0 && columnIndex < columnsCount - 1) {
              let d = this._columnMovingDeltaX;
              while (ec < columnsCount - 1 && d > getColumnWidth({ index: ec + 1 }) / 2) {
                d -= getColumnWidth({ index: ++ec });
              }
              if (
                columnIndex !== ec &&
                !(ec === displayColumns.length - rightSideColumns - leftSideColumns && deltaWidth > 0)
              ) {
                change = true;
              }
            }
            if (change) {
              const columnName = column.name;
              const selectedColumn = columns.find(c => c.name === columnName);

              if (!selectedColumn) {
                /**
                 * Это какая-то ошибка в нашем коде, если мы не нашли колонку по имени
                 */
                throw new Error(`Unknown column ${columnName}`);
              }
              const oldOrder = columnIndex;
              const newOrder = adjustFunc(ec);
              let newColumnSettings = columnsSettings;
              if (oldOrder !== newOrder) {
                if (!newColumnSettings) {
                  newColumnSettings = {};
                }
                //если перетянули колонку в первый раз, то создадим массив из всех колонок columns по очереди
                if (!newColumnSettings.order) {
                  newColumnSettings = {...newColumnSettings, order: displayColumns.map(c => c.name)};
                };
                let valueReturn = '';
                let value = '';
                const order = newColumnSettings.order!.map((s, idx) => {
                  valueReturn = s;
                  //если перетаскиваем колонку вправо, то колонки с oldSortNumber по newSortNumber смещаем на один влево
                  //если перетаскиваем колонку влево, то колонки с newSortNumber по oldSortNumber смещаем на один вправо
                  if (newOrder > oldOrder) {
                    if (idx === oldOrder) {
                      value = s;
                      valueReturn = newColumnSettings!.order![idx + 1]
                    }
                    else if (idx < newOrder && idx > oldOrder)
                      valueReturn = newColumnSettings!.order![idx + 1]
                    else if (idx === newOrder) valueReturn = value;
                  } else {
                    if (idx === newOrder) {
                      value = s;
                      valueReturn = newColumnSettings!.order![oldOrder];
                    } else if (idx > newOrder && idx < oldOrder) {
                      valueReturn = value;
                      value = s;
                    } else if (idx === oldOrder) valueReturn = value;
                  }
                  return valueReturn;
                });
                newColumnSettings = {...newColumnSettings, order};
              }
              this._updateUserSettings(newColumnSettings);
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
      rs,
      currentCol,
      onSetCursorPos,
      selectRows,
      onSelectRow,
      onToggleGroup,
      rightSideColumns,
      onSetFieldValue
    } = this.props;
    const {displayColumns} = this.state;
    const currentRow = rs.currentRow;
    const adjustedColumnIndex = adjustFunc(columnIndex);
    const styles = this._styles;

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
      : rowState !== TRowState.Normal
        ? rowState === TRowState.Edited || rowState === TRowState.Inserted
          ? styles.Edited
          : styles.Deleted
      : rowIndex % 2 === 0
      ? styles.EvenRowBackground
      : styles.OddRowBackground;

    const borderClass = fixed ? styles.FixedBorder : groupHeader ? styles.BorderBottom : styles.BorderRight;
    const textClass = !groupHeader && rowData.group && adjustedColumnIndex <= rowData.group.level ? styles.GrayText : styles.TextColor;
    const { fieldEditor } = this.state;

    if (
      fieldEditor
      &&
      currentRow === rowIndex
      &&
      adjustedColumnIndex === currentCol)
    {
      const fieldName = displayColumns[adjustedColumnIndex].fields[0].fieldName;
      return (
        <TextCellEditor
          key={key}
          style={style}
          value={rs.getString(fieldName)}
          onSave={
            (value: string) => {
              onSetFieldValue({ ref: this, rs, fieldName, value });
              this._captureFocus = true;
              if (this.state.fieldEditor) {
                this.setState({ fieldEditor: false });
              }
            }
          }
          onCancel={
            () => {
              this._captureFocus = true;
              if (this.state.fieldEditor) {
                this.setState({ fieldEditor: false });
              }
            }
          }
        />
      );
    }

    if (groupHeader && rowData.group && adjustedColumnIndex > rowData.group.level) {
      const onClick = () => onSetCursorPos({ref: this, rs, cursorCol: adjustedColumnIndex, cursorRow: rowIndex});
      return (
        <div
          className={cn(backgroundClass, borderClass)}
          key={key}
          style={style}
          onClick={onClick}
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
      (fixed || adjustedColumnIndex !== displayColumns.length - rightSideColumns) ? (
        displayColumns[adjustedColumnIndex].fields.map((fld, fldidx) => {
          const numberFormat = fld.numberFormat ? fld.numberFormat.name ? numberFormats[fld.numberFormat.name] : fld.numberFormat : undefined;
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
              {rs.getString(fld.fieldName, rowIndex, '', fld.dateFormat, numberFormat)}
              {groupRecCount}
            </span>
          ) :
          rs.getString(fld.fieldName, rowIndex, '', fld.dateFormat, numberFormat)
        })
      ) : (
        <span className={cn(styles.CellColumn, textClass)} />
      );

    const onCheckMarkClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onSelectRow({
        ref: this,
        rs,
        idx: rowIndex,
        selected: rs.allRowsSelected ? false : !rs.selectedRows[rowIndex]
      });
    };

    const checkMark =
      (rowState !== TRowState.Deleted) && selectRows && !adjustedColumnIndex ? (
        <div
          className={styles.CellMarkArea}
          onClick={onCheckMarkClick}
        >
          {rs.allRowsSelected || rs.selectedRows[rowIndex] ? '☑' : '☐'}
        </div>
      ) : (
        undefined
      );

    const onGroupTriangleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onToggleGroup({ref: this, rs, rowIdx: rowIndex});
    };

    const groupTriangle =
      groupHeader && rowData.group && adjustedColumnIndex === rowData.group.level ? (
        <div
          className={styles.CellMarkArea}
          onClick={onGroupTriangleClick}
        >
          {rowData.type === TRowType.HeaderCollapsed ? '▷' : '▽'}
        </div>
      ) : (
        undefined
      );

    const cellClassDiv = cn(fixed ? styles.FixedCell : '', styles.DataCellLeft);

    const onSetCursorPosClick = () => onSetCursorPos({ref: this, rs, cursorCol: adjustedColumnIndex, cursorRow: rowIndex});

    if (checkMark || groupTriangle) {
      return (
        <div
          className={cn(backgroundClass, borderClass, styles.CellRow)}
          key={key}
          style={style}
          onClick={onSetCursorPosClick}
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
          onClick={onSetCursorPosClick}
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
    const { rs, rightSideColumns, leftSideColumns } = this.props;
    const {displayColumns} = this.state;
    const styles = this._styles;
    const column = displayColumns[adjustFunc(columnIndex)];
    const classNames = cn(styles.CellColumn, styles.FooterCell, fixed ? styles.FixedCell : '');
    const cellText =
      fixed || displayColumns.length - rightSideColumns - leftSideColumns !== columnIndex
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
    const { rightSideColumns } = this.props;
    const { displayColumns, columnWidth, deltaWidth } = this.state;
    const adjustedIndex = adjustFunc(index);
    return !fixed && (displayColumns.length - rightSideColumns === adjustedIndex)
      ? deltaWidth
      : (
          (
            displayColumns[adjustedIndex] && displayColumns[adjustedIndex].width
            ? displayColumns[adjustedIndex].width!
            : columnWidth
          ) +
          (
            deltaWidth <= columnWidth && displayColumns.length === adjustedIndex + 1
            ? deltaWidth
            : 0
          )
        );
  };

  private _isRowLoaded = ({ index }: Index) => {
    return this.props.rs.status === TStatus.FULL
      || index < this.props.rs.size;
  };
}
