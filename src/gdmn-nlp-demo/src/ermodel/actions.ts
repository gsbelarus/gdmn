import { createAction } from 'typesafe-actions';
import { ERModel } from 'gdmn-orm';

export const setERModelLoading = createAction('ERMODEL/SET_LOADING', resolve => {
    return (loading: boolean) => resolve(loading);
  });

export type SetERModelLoading = typeof setERModelLoading;

export const loadERModel = createAction('ERMODEL/LOAD', resolve => {
    return (erModel: ERModel) => resolve(erModel);
  });

export type LoadERModel = typeof loadERModel;