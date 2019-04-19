/**
 * В том случае, когда рекорд сет загружается с сервера
 * rsMeta хранит идентификатор задачи загрузки данных.
 *
 * Имя объекта должно совпадать с именем рекорд сета.
 *
 * Само наличие объекта (даже пустого) говорит о том,
 * что запущен процесс получения данных.
 *
 * При закрытии вкладки объект rsMeta с соответствующим
 * именем удаляется. Проверка на отсутствие (исчезновение)
 * объекта в процессе подгрузки данных говорит нам о
 * необходимости принудительно прервать процесс.
 */

import { createAction, ActionType, getType } from "typesafe-actions";

export interface IRsMeta {
  taskKey?: string;
  error?: string;
};

export interface IRsMetaState {
  [rsName: string]: IRsMeta;
};

export const rsMetaActions = {
  setRsMeta: createAction(
    'RS_META/SET',
    resolve => (rsName: string, rsMeta: IRsMeta) => resolve({ rsName, rsMeta })
  ),

  deleteRsMeta: createAction(
    'RS_META/DELETE',
    resolve => (rsName: string) => resolve(rsName)
  )
};

export type TRsMetaActions = ActionType<typeof rsMetaActions>;

export function rsMetaReducer(state: IRsMetaState = {}, action: TRsMetaActions) {
  switch (action.type) {
    case getType(rsMetaActions.setRsMeta):
      return {
        ...state,
        [action.payload.rsName]: action.payload.rsMeta
      };

    case getType(rsMetaActions.deleteRsMeta): {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }

    default:
      return state;
  }
};