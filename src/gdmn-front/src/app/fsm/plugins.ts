import { Plugins, FSM, FSMPlugin } from "./fsm";
import { IFSMState } from "./types";
import { fsmStateTypes } from "./fsmStateTypes";
import * as H from 'history';

export const getPlugins = (history: H.History<any>): Plugins => {

  const showDataPlugin: FSMPlugin = (fsm: FSM, nextState: IFSMState) => {

    if (!nextState.inParams || !nextState.inParams['entityName']) {
      return false;
    }

    const entityName = nextState.inParams['entityName'];
    history.push(`/spa/gdmn/entity/${entityName}`);

    return true;
  }

  return new Map([
    [fsmStateTypes.showData, showDataPlugin]
  ]);
};