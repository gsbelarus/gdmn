import { ActionType, getType } from 'typesafe-actions';
import * as actions from './actions';

export type ParameterLoadAction = ActionType<typeof actions>;

export interface ISetParameterState {
  host: string,
  port: string,
  isReadFile: boolean,
}

const initialState: ISetParameterState = {
  host: 'localhost',
  port: '3001',
  isReadFile: false,
};

export function reducer(state: ISetParameterState = initialState, action: ParameterLoadAction): ISetParameterState {
  switch (action.type) {
    case getType(actions.loadingByParameter): {
      let { host, port, isReadFile } = action.payload;
      if (isReadFile) {
        return {
          ...state,
        }
      }

      if (!/^(0|[1-9]\d*)$/.test(port)) { port = ''; }
      else if (Number.parseInt(port, 10) > 65535) { port = '' }
      if (host !== '' || port !== '') {
        return {
          ...state
        }
      }
    }
    case getType(actions.parametersLoading): {
      const { host, port, isReadFile } = action.payload;
      if (isReadFile) {
        return {
          ...state,
          host: '',
          port: '',
          isReadFile,
        }
      }
      else {
        return {
          ...state,
          host,
          port,
          isReadFile,
        }
      }
    }
  }

  return state;
};
