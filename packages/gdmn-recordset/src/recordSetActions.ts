import { createAction } from "typesafe-actions";
import { RecordSet } from "./recordSet";
import { SortFields, Data, MasterLink } from "./types";
import { IFilter } from "./filter";

export type WithComponentName<T extends {} = {}> = { name: string } & T;

export const createRecordSet = createAction('RECORDSET/CREATE', resolve => {
  return (params: WithComponentName<{ rs: RecordSet }>) => resolve(params);
});

export type CreateRecordSet = typeof createRecordSet;

export const deleteRecordSet = createAction('RECORDSET/DELETE', resolve => {
  return (params: WithComponentName) => resolve(params);
});

export type DeleteRecordSet = typeof deleteRecordSet;

export const setRecordSetData = createAction('RECORDSET/SET_DATA', resolve => {
  return (params: WithComponentName<{ data: Data, masterLink?: MasterLink }>) => resolve(params);
});

export type SetRecordSetData = typeof setRecordSetData;

export const sortRecordSet = createAction('RECORDSET/SORT', resolve => {
  return (params: WithComponentName<{ sortFields: SortFields }>) => resolve(params);
});

export type SortRecordSet = typeof sortRecordSet;

export const setCurrentRow = createAction('RECORDSET/SET_CURRENT_ROW', resolve => {
  return (params: WithComponentName<{ currentRow: number }>) => resolve(params);
});

export type SetCurrentRow = typeof setCurrentRow;

export const setAllRowsSelected = createAction('RECORDSET/SET_ALL_ROWS_SELECTED', resolve => {
  return (params: WithComponentName<{ value: boolean }>) => resolve(params);
});

export type SetAllRowsSelected = typeof setAllRowsSelected;

export const selectRow = createAction('RECORDSET/SELECT_ROW', resolve => {
  return (params: WithComponentName<{ idx: number, selected: boolean }>) => resolve(params);
});

export type SelectRow = typeof selectRow;

export const setFilter = createAction('RECORDSET/SET_FILTER', resolve => {
  return (params: WithComponentName<{ filter: IFilter | undefined }>) => resolve(params);
});

export type SetFilter = typeof setFilter;

export const doSearch = createAction('RECORDSET/SEARCH', resolve => {
  return (params: WithComponentName<{ searchStr: string | undefined }>) => resolve(params);
});

export type DoSearch = typeof doSearch;

export const toggleGroup = createAction('RECORDSET/TOGGLE_GROUP', resolve => {
  return (params: WithComponentName<{ rowIdx: number }>) => resolve(params);
});

export type ToggleGroup = typeof toggleGroup;

export const collapseExpandGroups = createAction('RECORDSET/COLLAPSE_EXPAND_GROUPS', resolve => {
  return (params: WithComponentName<{ collapse: boolean }>) => resolve(params);
});

export type CollapseExpandGroups = typeof collapseExpandGroups;
