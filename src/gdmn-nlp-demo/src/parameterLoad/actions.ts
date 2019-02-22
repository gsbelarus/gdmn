import { createAction } from 'typesafe-actions';

export const setHost = createAction('PARAM/SET_HOST', resolve => {
  return (host: string) => resolve(host);
});

export type SetHost = typeof setHost;

export const setPort = createAction('PARAM/SET_PORT', resolve => {
  return (port: string) => resolve(port);
});

export type SetPort = typeof setPort;

export const setIsReadFile = createAction('PARAM/SET_IS_READ_FILE', resolve => {
  return (isReadFile: boolean) => resolve(isReadFile);
});

export type SetIsReadFile = typeof setIsReadFile;

export const loadingByParameter = createAction('PARAM/LOADING_BY_PARAM', resolve => {
  return (param: {host: string, port: string, isReadFile: boolean} ) => resolve(param);
});

export type LoadingByParam = typeof loadingByParameter;
