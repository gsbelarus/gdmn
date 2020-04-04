import { ScriptActions, scriptActions } from "./actions";
import { getType } from "typesafe-actions";

export interface IScript {
  id: string;
  source: string;
};

export interface IScriptState {
  scripts: {
    [id: string]: IScript;
  }
};

export function reducer(state: IScriptState = { scripts: {} }, action: ScriptActions) {
  switch (action.type) {
    case getType(scriptActions.assignScript):
      return { ...state, scripts: { ...state.scripts, [action.payload.id]: action.payload } };

    default:
      return state;
  }
};
