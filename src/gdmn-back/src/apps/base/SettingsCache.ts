import { ISettingEnvelope, isISettingData, ISettingParams, IListSettingQueryResponse } from 'gdmn-internals';
import { promises as fsPromises } from "fs";
import path from "path";

interface ICachedFile {
  settings: ISettingEnvelope[];
  changed?: boolean;
};

interface ICachedData {
  [type: string]: ICachedFile;
};

export class SettingsCache {

  private _cachedData: ICachedData = {};
  private _folder: string;

  constructor(folder: string) {
    this._folder = folder;
  }

  private _getSettingFileName(type: string) {
    return `${this._folder}\\type.${type}.json`;
  }

  public async flush(clear?: boolean) {
    for (const [type, data] of Object.entries(this._cachedData)) {
      if (data.changed) {
        const fileName = this._getSettingFileName(type);
        try {
          await fsPromises.mkdir(path.dirname(fileName), { recursive: true });
          await fsPromises.writeFile(fileName, JSON.stringify(data.settings, undefined, 2), { encoding: 'utf8', flag: 'w' });
          data.changed = false;
        }
        catch (e) {
          console.log(`Error writing data to file ${fileName} - ${e}`);
        }
      }
    }

    if (clear) {
      this._cachedData = {};
    }
  }

  private async _loadFromFile(type: string) {
    const fileName = this._getSettingFileName(type);
    try {
      const stat = await fsPromises.stat(fileName);

      if(!stat.isFile()) {
        return undefined;
      }

      const json = await fsPromises.readFile(fileName, { encoding: 'utf8', flag: 'r' });
      const arr = JSON.parse(json);

      if (Array.isArray(arr) && arr.length && isISettingData(arr[0])) {
        console.log(`${arr.length} objects from file ${fileName} has been read...`);
        return arr as ISettingEnvelope[];
      } else {
        console.log(`Unknown data structure in file ${fileName}`);
        return undefined;
      }
    } catch (err) {
      console.log(`Error reading file ${fileName}: ${err}`);
      return undefined;
    }
  }

  private async _settingsByType(type: string) {
    let data = this._cachedData[type];

    if (!data) {
      const settings = await this._loadFromFile(type);
      if (!settings) {
        return [];
      }
      data = { settings };
      this._cachedData[type] = data;
    }

    return data.settings.filter( s => isISettingData(s) );
  }

  public async querySetting(type: string, objectID: string) {
    const list = await this._settingsByType(type);
    return list.filter( s => s.objectID === objectID );
  }

  public async listSetting(type: string) {
    const list = await this._settingsByType(type);
    return { ids: list.map( s => s.objectID ) } as IListSettingQueryResponse;
  }

  // TODO: method called writeSetting but appropriate server command is called saveSetting
  public async writeSetting(setting: ISettingEnvelope, flush?: boolean) {
    const { type, objectID } = setting;

    // посмотрим, есть ли данные в кэше
    let data = this._cachedData[type];
    let query;

    if (data) {
      // если файл уже в кэше, то поищем в нем запись по типу и ИД объекта
      query = await this.querySetting(type, objectID);
    } else {
      // если нет, то может мы еще не считали с диска в кэш?
      // считаем, а заодно и поищем
      query = await this.querySetting(type, objectID);

      // теперь еще раз заглянем в кэш, вдруг что подгрузилось при поиске
      data = this._cachedData[type];
    }

    if (!data) {
      // значит на диске нет ничего, а соответственно и в кэше
      // добавим!
      this._cachedData[type] = { settings: [setting], changed: true };
    }
    else if (query.length) {
      // в кэше есть данные и есть объект с нужным нам ИД
      // надо заменить этот объект
      const idx = data.settings.findIndex( s => s.type === type && s.objectID === objectID );
      if (idx >= 0) {
        data.settings[idx] = setting;
        data.changed = true;
      }
    } else {
      // в кэше есть данные, но объекта с нужным нам ИД нет
      data.settings.push(setting);
      data.changed = true;
    }

    if (flush) {
      this.flush();
    }
  }

  public async deleteSetting(setting: ISettingParams) {
    const { type, objectID } = setting;

    // посмотрим, есть ли данные в кэше
    let data = this._cachedData[type];
    let query;

    if (data) {
      // если файл уже в кэше, то поищем в нем запись по типу и ИД объекта
      query = await this.querySetting(type, objectID);
    } else {
      // если нет, то может мы еще не считали с диска в кэш?
      // считаем, а заодно и поищем
      query = await this.querySetting(type, objectID);

      // теперь еще раз заглянем в кэш, вдруг что подгрузилось при поиске
      data = this._cachedData[type];
    }

    // удалить что-то можно только если оно существует
    if (data && query.length) {
      const idx = data.settings.findIndex( s => s.type === type && s.objectID === objectID );
      if (idx >= 0) {
        data.settings.splice(idx, 1);
        data.changed = true;
      }
    }
  }
}
