import { ActionType, getType } from 'typesafe-actions';
import * as actions from './actions';

export type ParameterLoadAction = ActionType<typeof actions>;

export interface ISetParameterState {
  host: string,
  port: string,
  isReadFile: boolean,
  hostLoad: string,
  portLoad: string,
  isReadFileLoad: boolean,
}

const initialState: ISetParameterState = {
  host: '',
  port: '',
  isReadFile: true,
  hostLoad: '',
  portLoad: '',
  isReadFileLoad: true,
};

export function reducer(state: ISetParameterState = initialState, action: ParameterLoadAction): ISetParameterState {
  switch (action.type) {
    case getType(actions.setHost): {
      let host = action.payload;
      return {
        ...state,
        host: host.length > 0 ? host : '',
      }
    }
    case getType(actions.setPort): {
      let port = action.payload;
      if (!/^(0|[1-9]\d*)$/.test(port)) {port='';}
      else if (Number.parseInt(port, 10) > 65535) {port=''}
      return {
        ...state,
        port
      };
    }
    case getType(actions.setIsReadFile): {
      const isReadFile = action.payload;
      return {
        ...state,
        isReadFile
      }
    }
    case getType(actions.loadingByParameter): {
      const { host, port, isReadFile} = action.payload;
      if(isReadFile) {
        return {
          ...state
        }
      }

      if(host !== '' || port !== '') {
        return {
          ...state
        }
      }
    }
    case getType(actions.parametersLoading) : {
      return {
        ...state,
        hostLoad: state.host,
        portLoad: state.port,
        isReadFileLoad: state.isReadFile,
      }
    }
  }

  return state;
};
