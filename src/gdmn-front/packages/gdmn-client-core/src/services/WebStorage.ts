import {bytesToMb} from '../utils/helpers';

interface IWebStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): any;
  remove(key: string): any;
  clear(): void;
}

interface IWebStorageOptions {
  namespace: string;
  caseSensitive?: boolean;
}

const enum WebStorageType {
  local = 'localStorage',
  session = 'sessionStorage' // cookies, // cache
}

// TODO test safari in private mode (Safari sets quota to 0 bytes)
// TODO window['caches'];
// TODO window[storageType][namespace] || "{}";
// inject = ['$window', '$cookies', '$cacheFactory'];

class WebStorage implements IWebStorage {
  public failSilently?: boolean;

  private storage: Storage;
  private readonly type: WebStorageType;
  private readonly options: IWebStorageOptions;

  constructor(type: WebStorageType, options: IWebStorageOptions, failSilently?: boolean) {
    this.storage = (<any>window)[type];
    this.type = type;
    this.options = options;
    this.failSilently = failSilently;
  }

  public async get(key: string): Promise<any> {
    return this.safe(() => {
      const value = this.storage.getItem(`${this.options.namespace}${key}`);
      try {
        return JSON.parse(value || '');
      } catch (e) {
        return value;
      }
    });
  }

  public async set(key: string, value: any) {
    this.safe(() => {
      this.storage.setItem(`${this.options.namespace}${key}`, JSON.stringify(value));
    });
  }

  public async remove(key: string) {
    this.safe(() => {
      /*
       * FIXME localStorage.hasOwnProperty doesn't exist in IE8 and is outright broken in Opera.
       * Source: https://shanetomlinson.com/2012/localstorage-bugs-inconsistent-removeitem-delete/
      */
      if (this.storage.hasOwnProperty(`${this.options.namespace}${key}`)) {
        this.storage.removeItem(`${this.options.namespace}${key}`);
      }
    });
  }

  public async clear() {
    // TODO await this.safe(() => this.storage.removeItem(this.options.namespace));
  }

  public static async isPersisted() {
    const persistent = await (<any>window.navigator).storage.persisted();
    console.log(
      persistent
        ? 'Storage will not be cleared except by explicit user action'
        : 'Storage may be cleared by the UA under storage pressure.'
    );

    return persistent;
  }

  public static async requestPersistPermission(): Promise<boolean> {
    // TODO Permissions.query()

    const granted = await (<any>window.navigator).storage.persist();
    console.log(
      granted
        ? 'Storage will not be cleared except by explicit user action'
        : 'Storage may be cleared by the UA under storage pressure.'
    );

    return granted;
  }

  public isPrivateMode(): boolean {
    try {
      this.storage.setItem('gdmn-test-private-mode', 'test'); // TODO localstorage
      this.storage.removeItem('gdmn-test-private-mode');
      return false;
    } catch (e) {
      return true;
    }
  }

  public static isStorageApiSupported(): boolean {
    return !!(<any>window.navigator).storage;
  }

  private async safe(cb: Function): Promise<any> {
    try {
      return cb();
    } catch (e) {
      if (!this.failSilently) {
        let causeInfo;
        switch (e.name) {
          case 'NS_ERROR_DOM_QUOTA_REACHED':
            causeInfo = 'maximum size reached';
            break;
          case 'NS_ERROR_FILE_NO_DEVICE_SPACE':
            causeInfo = 'insufficient: no device space';
            break;
          case 'NS_ERROR_FILE_CORRUPTED':
            causeInfo = 'corrupted';
            break;
        }
        if (!!causeInfo) {
          const { usage, quota }: { usage: number; quota: number } = await WebStorage.getEstimatedUsage();
          const usageInfo = `Using ${bytesToMb(usage)} MB out of ${quota} MB.`;

          // TODO custom error
          window.alert(
            `Sorry, it looks like your browser storage is ${causeInfo}. ${usageInfo}. Please clear your storage by going to Tools -> Clear Recent History -> Cookies and setting time range to "Everything". This will remove browser storage across all sites.`
          );
        }

        throw e;
      }
    }
  }

  private static async getEstimatedUsage() {
    return (<any>window.navigator).storage.estimate(); // TODO || navigator.webkitPersistentStorage
  }

  // addEventListener(listener: (this: Window, event: StorageEvent) => any, useCapture?: boolean) {
  //   window.addEventListener('storage', listener, useCapture);
  // }

  // removeEventListener

  // public isDBSupported(): boolean {
  //   return !!window.indexedDB;
  // }
}

export { WebStorage, IWebStorage, WebStorageType, IWebStorageOptions };
