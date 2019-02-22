import { ActionType, getType } from 'typesafe-actions';
import * as actions from './actions';

export type ParamAction = ActionType<typeof actions>;

export interface ISetParameterState {
  host: string,
  port: string,
  isReadFile: boolean,
}

const initialState: ISetParameterState = {
  host: '',
  port: '',
  isReadFile: false,
};

export function reducer(state: ISetParameterState = initialState, action: ParamAction): ISetParameterState {
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
      let errorMessage = null;
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
        console.log("not error, isReadFile")
        return {
          ...state
        }
      }

      if(host !== '' || port !== '') {
      console.log("not error, set host, port")
        return {
          ...state
        }
      }
    }
  }

  return state;
};
