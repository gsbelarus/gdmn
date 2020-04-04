import { ActionType, createAction } from 'typesafe-actions';
import { IScript } from './reducer';

export const scriptActions = {
  assignScript: createAction('script/ASSIGN', resolve => {
    return (script: IScript) => resolve(script);
  }),
};

export type ScriptActions = ActionType<typeof scriptActions>;
