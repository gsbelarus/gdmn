import { createAction } from 'typesafe-actions';
import { ERModel } from 'gdmn-orm';
import { RusPhrase } from 'gdmn-nlp';
import { ExecuteCommand } from '../engine/types';

export const setERModelLoading = createAction('ERMODEL/SET_LOADING', resolve => {
    return (param: { name: string, loading: boolean }) => resolve(param);
  });

export type SetERModelLoading = typeof setERModelLoading;

export const loadERModel = createAction('ERMODEL/LOAD', resolve => {
    return (param: { name: string, erModel: ERModel, executeCommand: ExecuteCommand }) => resolve(param);
  });

export type LoadERModel = typeof loadERModel;

export const processPhrase = createAction('ERMODEL/PROCESS_PHRASE', resolve => {
    return (param: {name: string, phrases: RusPhrase[] }) => resolve(param);
  });

export type ProcessPhrase = typeof processPhrase;

export const clearCommand = createAction('ERMODEL/CLEAR_COMMAND', resolve => {
    return (param: { name: string, clear: boolean }) => resolve(param);
  });

export type ClearCommand = typeof clearCommand;
