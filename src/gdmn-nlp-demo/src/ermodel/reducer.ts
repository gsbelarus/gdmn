import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ERModel, IERModel } from 'gdmn-orm';
import { ICommand, ERTranslatorRU } from 'gdmn-nlp-agent';
import { ExecuteCommand } from '../engine/types';

export type ERModelAction = ActionType<typeof actions>;

export interface IERModelState {
  loading: boolean;
  erModel?: ERModel;
  erTranslatorRU?: ERTranslatorRU;
  command?: ICommand[];
  commandError?: string;
  executeCommand?: ExecuteCommand;
};

export interface IERModels {
  [name: string]: IERModelState;
}

export function reducer(state: IERModels = {}, action: ERModelAction): IERModels {
  switch (action.type) {
    case getType(actions.loadERModel): {
      const { name, erModel, executeCommand } = action.payload;
      return {
        ...state,
        [name]: {
          loading: false,
          erModel,
          erTranslatorRU: erModel && new ERTranslatorRU(erModel),
          executeCommand
        }
      };
    }

    case getType(actions.setERModelLoading): {
      const { name, loading } = action.payload;
      return {
        ...state,
        [name]: {
          ...state[name],
          loading
        }
      }
    }

    case getType(actions.clearCommand): {
      const { name } = action.payload;

      if (state[name]) {
        return {
          ...state,
          [name]: {
            ...state[name],
            command: undefined,
            commandError: undefined
          }
        }
      }

      return state;
    }

    case getType(actions.processPhrase): {
      const { name, phrases } = action.payload;

      if (!state[name]) {
        return state;
      }

      const { erTranslatorRU } = state[name];

      if (!erTranslatorRU) {
        return {
          ...state,
          [name]: {
            ...state[name],
            command: undefined,
            commandError: 'ER model is not loaded...'
          }
        }
      }

      try {
        return {
          ...state,
          [name]: {
            ...state[name],
            command: erTranslatorRU.process(phrases),
            commandError: undefined
          }
        }
      }
      catch(err) {
        return {
          ...state,
          [name]: {
            ...state[name],
            command: undefined,
            commandError: err.message
          }
        }
      }
    }
  }

  return state;
};
