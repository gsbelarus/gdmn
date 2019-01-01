import { gdmnActions, TGdmnActions } from '@src/app/scenes/gdmn/actions';
import { ERModel } from 'gdmn-orm';
import { getType } from 'typesafe-actions';
import { IViewTab } from './types';

type TGdmnState = {
  erModel: ERModel;
  loading: boolean;
  loadingMessage?: string;
  viewTabs: IViewTab[];
};

const initialState: TGdmnState = {
  erModel: new ERModel(),
  loading: false,
  viewTabs: []
};

function reducer(state: TGdmnState = initialState, action: TGdmnActions) {
  switch (action.type) {
    case getType(gdmnActions.setSchema): {
      return {
        ...state,
        erModel: action.payload
      };
    }

    case getType(gdmnActions.setLoading): {
      return {
        ...state,
        loading: action.payload.loading,
        loadingMessage: action.payload.message
      };
    }

    case getType(gdmnActions.updateViewTab): {
      const idx = state.viewTabs.findIndex( vt => vt.url === action.payload.url );

      if (idx === -1) {
        return {
          ...state,
          viewTabs: [...state.viewTabs, action.payload]
        }
      } else {
        return {
          ...state,
          viewTabs: [...state.viewTabs.slice(0, idx), action.payload, ...state.viewTabs.slice(idx + 1)]
        }
      }
    }

    case getType(gdmnActions.deleteViewTab): {
      const idx = state.viewTabs.findIndex( vt => vt.url === action.payload.url );

      if (idx === -1) {
        return state;
      } else {
        return {
          ...state,
          viewTabs: [...state.viewTabs.slice(0, idx), ...state.viewTabs.slice(idx + 1)]
        }
      }
    }

    default:
      return state;
  }
}

export { reducer, TGdmnState };
