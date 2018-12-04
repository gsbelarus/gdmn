// @ts-ignore
import memoizeFormatConstructor from 'intl-format-cache';

class L10n {
  private static defaultDateTimeOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };
  private static defaultNumberOptions = { maximumFractionDigits: 0 };
  private static defaultMoneyOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  private static defaultCurrencyOptions = {
    style: 'currency',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  private static defaultPercentOptions = {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  private locale: string;
  private currency: string | undefined;

  private static getDateTimeFormatter = memoizeFormatConstructor(Intl.DateTimeFormat);
  private static getNumberFormatter = memoizeFormatConstructor(Intl.NumberFormat);

  constructor(defaultLocale: string, defaultCurrency?: string) {
    this.locale = defaultLocale;
    this.currency = defaultCurrency;
  }

  public formatNumber(value: any, numberFormatOptions = {}) {
    return L10n.getNumberFormatter(this.locale, {
      ...L10n.defaultNumberOptions,
      ...numberFormatOptions
    }).format(value);
  }

  public formatPercentage(value: any, numberFormatOptions = {}) {
    return L10n.getNumberFormatter(this.locale, {
      ...L10n.defaultPercentOptions,
      ...numberFormatOptions
    }).format(value);
  }

  public formatCurrency(value: any, numberFormatOptions: any = {}) {
    // TODO this.currency
    return L10n.getNumberFormatter(this.locale, {
      ...(numberFormatOptions.currency ? { ...L10n.defaultCurrencyOptions } : { ...L10n.defaultMoneyOptions }),
      ...numberFormatOptions
    }).format(value);
  }

  public formatDateTime(value: any, dateTimeOptions = L10n.defaultDateTimeOptions) {
    return L10n.getDateTimeFormatter(this.locale, dateTimeOptions).format(new Date(value));
  }

  public setLocale(locale: string) {
    this.locale = locale;
  }

  public setCurrency(currency: string | undefined) {
    this.currency = currency;
  }
}

export { L10n };
