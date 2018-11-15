import { createAction } from 'typesafe-actions';
import { ERModel } from 'gdmn-orm';
import { RusPhrase } from 'gdmn-nlp';

export const setERModelLoading = createAction('ERMODEL/SET_LOADING', resolve => {
    return (loading: boolean) => resolve(loading);
  });

export type SetERModelLoading = typeof setERModelLoading;

export const loadERModel = createAction('ERMODEL/LOAD', resolve => {
    return (erModel: ERModel) => resolve(erModel);
  });

export type LoadERModel = typeof loadERModel;

export const processPhrase = createAction('ERMODEL/PROCESS_PHRASE', resolve => {
    return (phrase: RusPhrase) => resolve(phrase);
  });

export type ProcessPhrase = typeof processPhrase;

export const clearCommand = createAction('ERMODEL/CLEAR_COMMAND', resolve => {
    return (clear: boolean) => resolve(clear);
  });

export type ClearCommand = typeof clearCommand;