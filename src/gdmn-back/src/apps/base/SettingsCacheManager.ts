import { SettingsCache } from './SettingsCache';

interface ISettingsCaches {
  [id: string]: SettingsCache;
}

class SettingsCacheManager {
  private _settingsCaches: ISettingsCaches = {}

  add(id: string, path: string) {
    const res = this._settingsCaches[id];

    if (res) {
      return res;
    }

    console.log(`Settings cache for db id: ${id}, path: ${path}`);

    const newCache = new SettingsCache(path);
    this._settingsCaches[id] = newCache;
    return newCache;
  }

  /*
  get(id: string) {
    const res = this._settingsCaches[id];

    if (!res) {
      throw new Error(`Unknown cache id ${id}`);
    }

    return res;
  }
  */

  flush(clear?: boolean) {
    Object.values(this._settingsCaches).forEach( s => s.flush(clear) );
  }
};

export const settingsCacheManager = new SettingsCacheManager();
