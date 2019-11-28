import { createAction, ActionType } from "typesafe-actions";
import { EntityQuery } from "gdmn-orm";
import { IMasterLink } from "gdmn-recordset";

export const loadRSActions = {
  loadRS: createAction('LOADRS/LOAD_RS', resolve => (params: { name: string, eq: EntityQuery }) => resolve(params) ),
  attachRS: createAction('LOADRS/ATTACH_RS', resolve => (params: { name: string, eq: EntityQuery, queryPhrase?: string, override?: boolean, masterLink?: IMasterLink }) => resolve(params) ),
  loadMoreRsData: createAction('LOADRS/LOAD_MORE_RS_DATA', resolve => (params: { name: string, rowsCount: number }) => resolve(params) ),
  deleteRS: createAction('LOADRS/DELETE_RS', resolve => (params: { name: string }) => resolve(params) ),
  postRS: createAction('LOADRS/POST_RS', resolve => (params: { name: string, callback?: () => void }) => resolve(params) )
}

export type LoadRSActions = ActionType<typeof loadRSActions>;
