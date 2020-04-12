import { ScriptActions, scriptActions } from "./actions";
import { getType } from "typesafe-actions";

export interface IScript {
  id: string;
  source?: string;
};

export interface IScriptState {
  scripts: {
    [id: string]: IScript;
  },
  listLoaded: boolean;
};

export function reducer(state: IScriptState = { scripts: {}, listLoaded: false }, action: ScriptActions) {
  switch (action.type) {
    case getType(scriptActions.assign): {
      const { scripts, listLoaded } = action.payload;
      let res = state;

      for (const script of scripts) {
        res = { ...res, scripts: { ...res.scripts, [script.id]: script } };
      }

      if (listLoaded === undefined) {
        return res;
      } else {
        return { ...res, listLoaded }
      }
    }

    default:
      return state;
  }
};
