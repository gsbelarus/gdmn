import { getType } from 'typesafe-actions';
import { ERModel } from 'gdmn-orm';

import { gdmnActions, TGdmnActions } from '@src/app/scenes/gdmn/actions';
import { IViewTab } from './types';

export type TGdmnState = {
  erModel: ERModel;
  loading: boolean;
  loadingCounter: number;
  loadingMessage?: string;
  viewTabs: IViewTab[];
};

const initialState: TGdmnState = {
  erModel: new ERModel(),
  loading: false,
  loadingCounter: 0,
  viewTabs: []
};

export function reducer(state: TGdmnState = initialState, action: TGdmnActions) {
  switch (action.type) {
    case getType(gdmnActions.setSchema): {
      return {
        ...state,
        erModel: action.payload
      };
    }

    case getType(gdmnActions.setLoading): {
      let { loadingCounter, loading } = state;

      // TODO TMP
      // if (action.payload.loading) {
      //   loadingCounter++;
      // } else if (loadingCounter > 0) {
      //   loadingCounter--;
      // }
      //
      // loading = action.payload.loading;
      // if (!action.payload.loading && loadingCounter > 0) {
      //   loading = true;
      // }

      return {
        ...state,
        loading,
        loadingCounter,
        loadingMessage: action.payload.message
      };
    }

    case getType(gdmnActions.addViewTab): {
      const idx = state.viewTabs.findIndex(vt => vt.url === action.payload.url);

      if (idx === -1) {
        return {
          ...state,
          viewTabs: [...state.viewTabs, action.payload]
        };
      } else {
        throw new Error(`ViewTab with url ${action.payload.url} already exists`);
      }
    }

    case getType(gdmnActions.updateViewTab): {
      const idx = state.viewTabs.findIndex(vt => vt.url === action.payload.url);

      if (idx === -1) {
        throw new Error(`Can't find a tab with url ${action.payload.url}`);
      } else {
        return {
          ...state,
          viewTabs: [...state.viewTabs.slice(0, idx), action.payload, ...state.viewTabs.slice(idx + 1)]
        };
      }
    }

    case getType(gdmnActions.deleteViewTab): {
      const idx = state.viewTabs.findIndex(vt => vt.url === action.payload.url);

      if (idx === -1) {
        throw new Error(`Can't find a tab with url ${action.payload.url}`);
      } else {
        return {
          ...state,
          viewTabs: [...state.viewTabs.slice(0, idx), ...state.viewTabs.slice(idx + 1)]
        };
      }
    }

    default:
      return state;
  }
}

