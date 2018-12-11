import { Columns } from "./Grid";
import { createAction } from "typesafe-actions";
import { SortFields } from "gdmn-recordset";

export type WithComponentName<T extends {} = {}> = { name: string } & T;

export const createGrid = createAction('GRID/CREATE', resolve => {
  return (params: WithComponentName<{
    columns: Columns,
    leftSideColumns: number,
    rightSideColumns: number,
    hideFooter: boolean
  }>) => resolve(params);
});

export type CreateGrid = typeof createGrid;

export const setFixedColumns = createAction('GRID/SET_FIXED_COLUMNS', resolve => {
  return (params: WithComponentName<{ leftSideColumns: number }>) => resolve(params);
});

export type SetFixedColumns = typeof setFixedColumns;

export const setFixedTailColumns = createAction('GRID/SET_FIXED_TAIL_COLUMNS', resolve => {
  return (params: WithComponentName<{ rightSideColumns: number }>) => resolve(params);
});

export type SetFixedTailColumns = typeof setFixedTailColumns;

export const resizeColumn = createAction('GRID/RESIZE_COLUMN', resolve => {
  return (params: WithComponentName<{columnIndex: number, newWidth: number}>) => resolve(params);
});

export type ResizeColumn = typeof resizeColumn;

export const columnMove = createAction('GRID/COLUMN_MOVE', resolve => {
  return (params: WithComponentName<{oldIndex: number, newIndex: number}>) => resolve(params);
});

export type ColumnMove = typeof columnMove;

export const toggleColumn = createAction('GRID/TOGGLE_COLUMN', resolve => {
  return (params: WithComponentName<{ columnName: string }>) => resolve(params);
});

export type ToggleColumn = typeof toggleColumn;

export const setSelectRows = createAction('GRID/SET_SELECT_ROWS', resolve => {
  return (params: WithComponentName<{ value: boolean }>) => resolve(params);
});

export type SetSelectRows = typeof setSelectRows;

export const toggleHideFooter = createAction('GRID/TOGGLE_SHOW_FOOTER', resolve => {
  return (params: WithComponentName) => resolve(params);
});

export type ToggleHideFooter = typeof toggleHideFooter;

export const toggleHideHeader = createAction('GRID/TOGGLE_SHOW_HEADER', resolve => {
  return (params: WithComponentName) => resolve(params);
});

export type ToggleHideHeader = typeof toggleHideHeader;

export const setCursorCol = createAction('GRID/SET_CURSOR_COL', resolve => {
  return (cursor: WithComponentName<{ cursorCol: number }>) => resolve(cursor);
});

export type SetCursorCol = typeof setCursorCol;

export const deleteGrid = createAction('GRID/DELETE', resolve => {
  return (params: WithComponentName) => resolve(params);
});

export type DeleteGrid = typeof deleteGrid;

export const showSortDialog = createAction('GRID/SHOW_SORT_DIALOG', resolve => {
  return (params: WithComponentName<{}>) => resolve(params);
});

export type ShowSortDialog = typeof showSortDialog;

export const cancelSortDialog = createAction('GRID/CANCEL_SORT_DIALOG', resolve => {
  return (params: WithComponentName<{}>) => resolve(params);
});

export type CancelSortDialog = typeof showSortDialog;

export const applySortDialog = createAction('GRID/APPLY_SORT_DIALOG', resolve => {
  return (params: WithComponentName<{ sortFields: SortFields }>) => resolve(params);
});

export type ApplySortDialog = typeof applySortDialog;

export const setSearchIdx = createAction('GRID/SET_SEARCH_IDX', resolve => {
  return (params: WithComponentName<{ searchIdx: number }>) => resolve(params);
});

export type SetSearchIdx = typeof setSearchIdx;



