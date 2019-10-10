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

  return columns.map(c => {

    const userColumnSettings = userSettings[c.name];

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
  });
}
