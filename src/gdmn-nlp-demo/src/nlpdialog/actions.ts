import { createAction } from 'typesafe-actions';
import { INLPDialogItem } from 'gdmn-nlp-agent';

export const clearNLPDialog = createAction('NLPDIALOG/CLEAR', resolve => () => resolve() );

export type ClearNLPDialog = typeof clearNLPDialog;

export const addNLPItem = createAction('NLPDIALOG/ADD', resolve => (item: INLPDialogItem) => resolve(item) );

export type AddNLPItem = typeof addNLPItem;