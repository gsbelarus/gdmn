import i18next from 'i18next';
// @ts-ignore
import i18nextFetchBackend from 'i18next-fetch-backend';
import i18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';
// @ts-ignore
import i18nextLocalstorageCache from 'i18next-localstorage-cache';

import { L10n } from './L10n';
import { promisify } from '../utils/helpers';

const DEFAULT_LANG_CODE = 'en';
const DEFAULT_CURRENCY = 'USD';

class I18n {
  private intlService = new L10n(DEFAULT_LANG_CODE, DEFAULT_CURRENCY);
  private i18nextService = i18next
    .use(i18nextFetchBackend)
    .use(i18nextLocalstorageCache)
    .use(i18nextBrowserLanguageDetector)
    .use(reactI18nextModule);

  private langCode: string = DEFAULT_LANG_CODE;

  private static instance: I18n = new I18n();

  private constructor() {
    if (!!I18n.instance) {
      throw new Error('Instantiation failed: use i18n.getInstance() instead of new()');
    }
  }

  public static getInstance(): I18n {
    return I18n.instance;
  }

  public async init(loadLocales: Function, storgePrefix: string) {
    await Promise.all([this.initI18next(loadLocales, storgePrefix), this.ensureIntlSupported()]);
  }

  private async initI18next(loadLocales: Function, storagePrefix: string) {
    this.i18nextService.on('initialized', this.onInitialized.bind(this));
    this.i18nextService.on('languageChanged', this.onLanguageChanged.bind(this));

    return promisify(this.i18nextService.init.bind(this.i18nextService))({
      debug: true,
      whitelist: ['en', 'ru'],
      ns: ['common'],
      defaultNS: 'common',
      load: 'currentOnly',
      // keySeparator: false, // allow usage of dots in keys
      nsSeparator: '::',
      interpolation: {
        escapeValue: false, // not needed for react
        format: (value: any, format: any, lng: any) => {
          switch (format) {
            case 'intlNumber':
              return this.intlService.formatNumber(value);
            case 'intlPercentage':
              return this.intlService.formatPercentage(value);
            case 'intlCurrency':
              return this.intlService.formatCurrency(value);
            case 'intlDateTime':
              return this.intlService.formatDateTime(value);
            default:
              // if (value instanceof Date) return intlService.formatDateTime(value);
              // if (typeof value === "number") return intlService.formatNumber(value);
              return value;
          }
        }
      },
      react: {
        wait: true
      },
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        lookupQuerystring: 'lng',
        lookupLocalStorage: `${storagePrefix}:lng`,
        caches: ['localStorage']
      },
      backend: {
        loadPath: '{{lng}}/{{ns}}.json',
        jsonIndent: 2,
        parse: (data: any) => data,
        ajax: loadLocales
      },
      cache: {
        enabled: true,
        prefix: `${storagePrefix}:lng_res_`,
        expirationTime: 7 * 24 * 60 * 60 * 1000
      }
    });
  }

  private onInitialized(options: any) {
    this.langCode = this.i18nextService.language;
  }

  private async onLanguageChanged(lang: string) {
    this.langCode = lang;
    this.intlService.setLocale(lang);
    await this.ensureIntlSupported();
  }

  private async ensureIntlSupported() {
    // @ts-ignore // fixme
    if (global.Intl) return; // TODO && global.IntlPolyfill

    // await import(/* webpackMode: "lazy", webpackChunkName: "intl-[index]" */
    // 'intl');
    // await import(/* webpackMode: "lazy", webpackChunkName: "intl-[index]" */
    // `intl/locale-data/jsonp/${this.langCode}.js`);
  }

  public async changeLanguage(lang: string) {
    await promisify(this.i18nextService.changeLanguage.bind(this.i18nextService))(lang);
  }

  // accessors

  public getI18nextService() {
    return this.i18nextService;
  }

  public getIntlService() {
    return this.intlService;
  }
}

export { I18n };
