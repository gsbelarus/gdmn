import { getType } from 'typesafe-actions';
import { ERModel } from 'gdmn-orm';
import { gdmnActions, GdmnAction } from '@src/app/scenes/gdmn/actions';
import { IViewTab } from './types';
import { IApplicationInfo, ITemplateApplication } from '@gdmn/server-api';
import { themes } from '../themeeditor/themes';
import { IGridColors } from 'gdmn-grid';
import { calcGridColors } from '@src/app/utils/calcGridColors';
import { NLPDialog } from 'gdmn-nlp-agent';

export type TGdmnState = {
  erModel: ERModel;
  loading: boolean;
  loadingCounter: number;
  loadingMessage?: string;
  viewTabs: IViewTab[];
  apps: Array<IApplicationInfo & {loading?: boolean}>;
  templates?: ITemplateApplication[];
  sessionInfo: any[];
  theme: string;
  gridColors: IGridColors;
  nlpDialog: NLPDialog;
};

const initialState: TGdmnState = {
  erModel: new ERModel(),
  loading: false,
  loadingCounter: 0,
  viewTabs: [],
  apps: [],
  sessionInfo: [],
  theme: themes[0].name,
  gridColors: calcGridColors(),
  nlpDialog: []
};

export function reducer(state: TGdmnState = initialState, action: GdmnAction): TGdmnState {
  switch (action.type) {

    case getType(gdmnActions.setSchema): {
      return {
        ...state,
        erModel: action.payload
      };
    }

    case getType(gdmnActions.nlpClear): {
      return {
        ...state,
        nlpDialog: []
      };
    }

    case getType(gdmnActions.nlpAdd): {
      return {
        ...state,
        nlpDialog: [...state.nlpDialog, ...action.payload]
      };
    }

    case getType(gdmnActions.createApp): {
      return {
        ...state,
        apps: [...state.apps, {...action.payload}]
      };
    }

    case getType(gdmnActions.updateApp): {
      const idx = state.apps.findIndex(app => app.uid === action.payload.uid);

      if (idx > -1) {
        const apps = [...state.apps];
        apps[idx] = {...apps[idx], ...action.payload.application};
        return {...state, apps};
      } else {
        throw new Error(`App ${action.payload} is not found`)
      }
    }

    case getType(gdmnActions.deleteApp): {
      const idx = state.apps.findIndex(app => app.uid === action.payload);

      if (idx > -1) {
        return {
          ...state,
          apps: [...state.apps.slice(0, idx), ...state.apps.slice(idx + 1)]
        };
      } else {
        throw new Error(`App ${action.payload} is not found`)
      }
    }

    case getType(gdmnActions.setApps): {
      return {
        ...state,
        apps: action.payload
      };
    }

    case getType(gdmnActions.setTemplates): {
      return {
        ...state,
        templates: action.payload
      };
    }

    case getType(gdmnActions.setLoading): {
      let { loadingCounter, loading } = state;

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
        return {
          ...state,
          viewTabs: [...state.viewTabs.slice(0, idx), action.payload, ...state.viewTabs.slice(idx + 1)]
        };
      }
    }

    case getType(gdmnActions.updateViewTab): {
      const idx = state.viewTabs.findIndex(vt => vt.url === action.payload.url);

      if (idx > -1) {
        return {
          ...state,
          viewTabs: [...state.viewTabs.slice(0, idx), {...state.viewTabs[idx], ...action.payload.viewTab}, ...state.viewTabs.slice(idx + 1)]
        };
      } else {
        return state;
      }
    }

    case getType(gdmnActions.deleteViewTab): {
      const { viewTabURL } = action.payload;
      const idx = state.viewTabs.findIndex(vt => vt.url === viewTabURL);

      if (idx === -1) {
        throw new Error(`Can't find a tab with url ${viewTabURL}`);
      } else {
        return {
          ...state,
          viewTabs: [...state.viewTabs.slice(0, idx), ...state.viewTabs.slice(idx + 1)]
        };
      }
    }

    case getType(gdmnActions.saveSessionData): {
      const { viewTabURL, sessionData, merge } = action.payload;
      const { viewTabs } = state;
      const idx = state.viewTabs.findIndex(vt => vt.url === viewTabURL);

      if (idx !== -1) {
        const newViewTabs = [...viewTabs];

        if (merge) {
          newViewTabs[idx] = {
            ...newViewTabs[idx],
            sessionData: {...newViewTabs[idx].sessionData, ...sessionData}
          };
        } else {
          newViewTabs[idx] = {
            ...newViewTabs[idx],
            sessionData
          };
        }

        return {
          ...state,
          viewTabs: newViewTabs
        };
      }
      return state;
    }

    case getType(gdmnActions.getSessionInfo): {
      return {
        ...state,
        sessionInfo: action.payload
      };
    }

    case getType(gdmnActions.setThemeAndGridColors): {
      return {
        ...state,
        theme: action.payload.theme,
        gridColors: action.payload.gridColors
      };
    }

    default:
      return state;
  }
}
