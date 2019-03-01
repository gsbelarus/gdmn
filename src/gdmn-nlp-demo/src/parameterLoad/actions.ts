import { createAction } from 'typesafe-actions';

export const loadingByParameter = createAction('PARAM/LOADING_BY_PARAM', resolve => {
  return (param: {host: string, port: string, isReadFile: boolean} ) => resolve(param);
});

export type LoadingByParam = typeof loadingByParameter;

export const parametersLoading = createAction('PARAM/PARAMETERS_LOADING', resolve => {
  return (param: {host: string, port: string, isReadFile: boolean} ) => resolve(param);
});

export type ParametersLoading = typeof parametersLoading;
