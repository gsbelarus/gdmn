import { createAction } from 'typesafe-actions';
import { INLPDialogItem } from 'gdmn-nlp-agent';
import { ParsedText } from 'gdmn-nlp';

export const clearNLPDialog = createAction('NLPDIALOG/CLEAR', resolve => () => resolve() );

export type ClearNLPDialog = typeof clearNLPDialog;

export const addNLPItem = createAction('NLPDIALOG/ADD',
  resolve => (param: { item: INLPDialogItem, parsedText?: ParsedText[], recordSetName?: string }) => resolve(param)
);

export type AddNLPItem = typeof addNLPItem;
