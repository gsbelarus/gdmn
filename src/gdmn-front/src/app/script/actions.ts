import { ActionType, createAction } from 'typesafe-actions';
import { IScript } from './reducer';

export const scriptActions = {
  /**
   * Добавляет переданный список скриптов в хранилище.
   * Если флаг listLoaded задан, то он будет установлен в переданное значение.
   * */
  assign: createAction('SCRIPT/ASSIGN', resolve => (param: { scripts: IScript[], listLoaded?: boolean }) => resolve(param) ),
  /**
   * Загружает заданный скрипт с сервера.
   * */
  load: createAction('SCRIPT/LOAD', resolve => (scriptId: string) => resolve(scriptId) ),
  /** Загружает с сервера список идентификаторов всех скриптов. */
  list: createAction('SCRIPT/LIST'),
  /** Сохраняет скрипт на сервере и в хранилище. */
  save: createAction('SCRIPT/SAVE', resolve => (param: { id: string, source: string }) => resolve(param) ),
};

export type ScriptActions = ActionType<typeof scriptActions>;
