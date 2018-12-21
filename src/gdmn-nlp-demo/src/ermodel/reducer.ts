import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ERModel } from 'gdmn-orm';
import { ICommand, ERTranslatorRU } from 'gdmn-nlp-agent';

export type ERModelAction = ActionType<typeof actions>;

export interface IERModelState {
  loading: boolean;
  erModel?: ERModel;
  erTranslatorRU?: ERTranslatorRU;
  command?: ICommand[];
  commandError?: string;
};

const initialState: IERModelState = {
  loading: false
};

export function reducer(state: IERModelState = initialState, action: ERModelAction): IERModelState {
  switch (action.type) {
    case getType(actions.loadERModel): {
      const erModel = action.payload;
      return {
        ...state,
        erModel,
        erTranslatorRU: new ERTranslatorRU(erModel),
        loading: false
      }
    }

    case getType(actions.setERModelLoading): {
      const loading = action.payload;
      return {
        ...state,
        loading
      }
    }

    case getType(actions.clearCommand): {
      return {
        ...state,
        command: undefined,
        commandError: undefined
      }
    }

    case getType(actions.processPhrase): {
      const phrase = action.payload;
      const { erTranslatorRU } = state;

      if (!erTranslatorRU) {
        return {
          ...state,
          command: undefined,
          commandError: 'ER model is not loaded...'
        }
      }

      try {
        return {
          ...state,
          command: erTranslatorRU.process(phrase),
          commandError: undefined
        }
      }
      catch(err) {
        return {
          ...state,
          command: undefined,
          commandError: err.message
        }
      }
    }
  }

  return state;
};