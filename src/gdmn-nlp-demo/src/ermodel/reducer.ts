import { getType, ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ERModel } from 'gdmn-orm';

export type ERModelAction = ActionType<typeof actions>;

export interface IERModelState {
  loading: boolean;
  erModel?: ERModel;
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
  }

  return state;
};