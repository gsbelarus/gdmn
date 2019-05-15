import { createAction, ActionType } from "typesafe-actions";
import { IRecordSetDataOptions, RecordSet } from "./recordSet";
import { SortFields, IDataRow, TDataType } from "./types";
import { IFilter } from "./filter";

export type WithComponentName<T extends {} = {}> = { name: string } & T;

export const rsActions = {
  createRecordSet: createAction('RECORDSET/CREATE', resolve => {
    return (params: WithComponentName<{ rs: RecordSet, override?: boolean }>) => resolve(params);
  }),


  setRecordSet: createAction('RECORDSET/SET', resolve => {
    return (rs: RecordSet) => resolve(rs);
  }),


  deleteRecordSet: createAction('RECORDSET/DELETE', resolve => {
    return (params: WithComponentName) => resolve(params);
  }),


  setData: createAction('RECORDSET/SET_DATA', resolve => {
    return (params: WithComponentName<IRecordSetDataOptions>) => resolve(params);
  }),


  loadingData: createAction('RECORDSET/LOADING_DATA', resolve => {
    return (params: WithComponentName) => resolve(params);
  }),


  addData: createAction('RECORDSET/ADD_DATA', resolve => {
    return (params: WithComponentName<{ records: IDataRow[], full?: boolean }>) => resolve(params);
  }),


  sortRecordSet: createAction('RECORDSET/SORT', resolve => {
    return (params: WithComponentName<{ sortFields: SortFields }>) => resolve(params);
  }),


  setCurrentRow: createAction('RECORDSET/SET_CURRENT_ROW', resolve => {
    return (params: WithComponentName<{ currentRow: number }>) => resolve(params);
  }),


  setAllRowsSelected: createAction('RECORDSET/SET_ALL_ROWS_SELECTED', resolve => {
    return (params: WithComponentName<{ value: boolean }>) => resolve(params);
  }),


  selectRow: createAction('RECORDSET/SELECT_ROW', resolve => {
    return (params: WithComponentName<{ idx: number, selected: boolean }>) => resolve(params);
  }),


  setFilter: createAction('RECORDSET/SET_FILTER', resolve => {
    return (params: WithComponentName<{ filter: IFilter | undefined }>) => resolve(params);
  }),


  doSearch: createAction('RECORDSET/SEARCH', resolve => {
    return (params: WithComponentName<{ searchStr: string | undefined }>) => resolve(params);
  }),


  toggleGroup: createAction('RECORDSET/TOGGLE_GROUP', resolve => {
    return (params: WithComponentName<{ rowIdx: number }>) => resolve(params);
  }),


  collapseExpandGroups: createAction('RECORDSET/COLLAPSE_EXPAND_GROUPS', resolve => {
    return (params: WithComponentName<{ collapse: boolean }>) => resolve(params);
  }),


  deleteRows: createAction('RECORDSET/DELETE_ROWS', resolve => {
    return (params: WithComponentName<{ remove?: boolean, rowsIdxs?: number[] }>) => resolve(params);
  }),


  cancel: createAction('RECORDSET/CANCEL', resolve => {
    return (params: WithComponentName) => resolve(params);
  }),


  insert: createAction('RECORDSET/INSERT', resolve => {
    return (params: WithComponentName) => resolve(params);
  }),

  setLocked: createAction('RECORDSET/SET_LOCKED', resolve => {
    return (params: WithComponentName<{ locked: boolean }>) => resolve(params);
  }),


  setFieldValue: createAction('RECORDSET/SET_FIELD_VALUE', resolve => {
    return (params: WithComponentName<{ fieldName: string, value: TDataType }>) => resolve(params);
  })
};

export type RSAction = ActionType<typeof rsActions>;
