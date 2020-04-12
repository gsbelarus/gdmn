import { GdmnPubSubApi } from "../services/GdmnPubSubApi";
import { TThunkMiddleware } from "../store/middlewares";
import { getType } from "typesafe-actions";
import { scriptActions, ScriptActions } from "./actions";
import { rootActions } from "../scenes/root/actions";

export const scriptMiddleware = (apiService: GdmnPubSubApi): TThunkMiddleware => ({ dispatch, getState }) => next => async (action: ScriptActions) => {

  if (!action.type.startsWith('SCRIPT/')) {
    return next(action);
  }

  switch (action.type) {
    case getType(scriptActions.load): {
      const scriptId = action.payload;
      const script = getState().script.scripts[scriptId];

      if (!script || script.source === undefined) {
        apiService.querySetting({ query: [ { type: 'SCRIPT', objectID: scriptId } ] })
        .then( response => {
          if (response.error) {
            rootActions.showMessage(response.error.message);
          } else if (!response.payload.result || !response.payload.result.length) {
            rootActions.showMessage(`Script with id=${scriptId} has not been found on server`);
          } else {
            const loadedScript = response.payload.result[0];
            dispatch(scriptActions.assign({ scripts: [{ id: scriptId, source: loadedScript.data.source }] }))
          }
        });
      }
    }

    case getType(scriptActions.list): {
      apiService.listSetting({ query: { type: 'SCRIPT' } })
      .then( response => {
        if (response.error) {
          rootActions.showMessage(response.error.message);
        }
        else if (response.payload.result) {
          dispatch(scriptActions.assign({ scripts: response.payload.result.ids.map( id => ({ id }) ), listLoaded: true }));
        }
      });
    }
  }

  return next(action);
};
