import { ActionType, createAction } from 'typesafe-actions';
import { EntityQuery, Attribute } from 'gdmn-orm';

export const mdgActions = {
  addNewBinding: createAction('mdg/ADD_NEW', resolve => (params: {masterRS: string, detailsRS: string, attr: Attribute<any>, entityQuery: EntityQuery}) => resolve(params) ),
  editeMasterRS: createAction('mdg/EDITE_MASTER_RS', resolve => (params: {masterRS: string, detailsRS: string, oldAttr: Attribute<any>, newAttr: Attribute<any>}) => resolve(params) ),
  editeValue: createAction('mdg/EDITE_VALUE', resolve => (params: {masterRS: string, detailsRS: string, attr: Attribute<any>, value: string}) => resolve(params) ),
  deleteBinding: createAction('mdg/DELETE', resolve => (params: {masterRS: string, detailsRS: string, attr: Attribute<any>}) => resolve(params) )
}

export type MDGAction = ActionType<typeof mdgActions>;
