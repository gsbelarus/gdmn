import { createAction, ActionType } from "typesafe-actions";
import { EntityQuery } from "gdmn-orm";

export const attachRS = createAction('LOADRS/ATTACH_RS', resolve => (params: { name: string, eq: EntityQuery, override?: boolean }) => resolve(params) );

export type AttachRS = typeof attachRS;

export const loadMoreRsData = createAction('LOADRS/LOAD_MORE_RS_DATA', resolve => (params: { name: string, rowsCount: number }) => resolve(params) );

export type LoadMoreRsData = typeof loadMoreRsData;

export const deleteRS = createAction('LOADRS/DELETE_RS', resolve => (params: { name: string }) => resolve(params) );

export type DeleteRS = typeof deleteRS;

export type LoadRSActions = ActionType<AttachRS | LoadMoreRsData | DeleteRS>;


