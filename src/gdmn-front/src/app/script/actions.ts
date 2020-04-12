import { ActionType, createAction } from 'typesafe-actions';
import { IScript } from './reducer';

export const scriptActions = {
  assign: createAction('SCRIPT/ASSIGN', resolve => (param: { scripts: IScript[], listLoaded?: boolean }) => resolve(param) ),
  load: createAction('SCRIPT/LOAD', resolve => (scriptId: string) => resolve(scriptId) ),
  list: createAction('SCRIPT/LIST'),
};

export type ScriptActions = ActionType<typeof scriptActions>;
