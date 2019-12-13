import { Columns } from "./Grid";
import { IUserColumnsSettings } from "./types";


/**
 *
 * @param columns - колонки с глобальными настройками
 * @param userSettings - настройки пользователя
 *
 * Возвращаем объединенные настройки колонок, глобальные с настройками пользователя
 */
export function applyUserSettings(columns: Columns, userSettings: IUserColumnsSettings): Columns {

  return columns.map((c, idx) => {

    if (!userSettings.columns) {
      return c;
    }

    const userColumnSettings = userSettings.columns[c.name];

    if (!userColumnSettings) {
      return c;
    }
    return {
      ...c,
      hidden: userColumnSettings.hidden !== undefined ? userColumnSettings.hidden : c.hidden,
      caption: userColumnSettings.caption !== undefined ? userColumnSettings.caption : c.caption,
      width: userColumnSettings.width !== undefined ? userColumnSettings.width : c.width,
      fields: c.fields.map(f =>
        f.fieldName === c.name
        ? {...f,
          numberFormat: userColumnSettings.numberFormatName !== undefined ? {name: userColumnSettings.numberFormatName} : f.numberFormat,
          dateFormat:  userColumnSettings.dateFormat !== undefined ? userColumnSettings.dateFormat : f.dateFormat
        }
        : f
      )
    };
  })
  .sort((a, b) => {
    return userSettings.order
      ? userSettings.order.findIndex(o => o === a.name) > userSettings.order.findIndex(o => o === b.name) ? 1 : -1
      : 1
    });
}
