export interface INumberFormat {
  minIntDigits?: number;
  minDecDigits?: number;
  maxDecDigits?: number;
  decSeparator?: string;
  groupSeparator?: string;
  useGrouping?: boolean;
  currSign?: string;
  currSignPlaceBefore?: boolean;
};

export type FormatNumber = (n: number, format?: INumberFormat) => string;

export const formatNumber: FormatNumber = (n: number, format?: INumberFormat): string => {

  if (!format) {
    return n.toString();
  }

  const { minDecDigits, maxDecDigits, useGrouping, groupSeparator, decSeparator, minIntDigits, currSign, currSignPlaceBefore } = format;
  let res = n.toString();
  let m = res.split('.');

  if (minDecDigits !== undefined || maxDecDigits !== undefined) {
    let decDigits = m[1] ? m[1].length : 0;

    if (minDecDigits) {
      decDigits = Math.max(decDigits, minDecDigits);
    }

    if (maxDecDigits) {
      decDigits = Math.min(decDigits, maxDecDigits);
    }

    res = n.toFixed(decDigits);
  }

  if (minIntDigits) {
    for (let i = minIntDigits - m[0].length; i > 0; i--) {
      res = '0' + res;
    }
  }

  if (useGrouping) {
    let b = res.lastIndexOf('.');
    let e = res.length;

    if (b === -1) {
      b = res.length - 1;
    } else {
      b--;
    }

    const parts: string[] = [];
    let g = 1;

    while (b > 0 && (b > 1 || (res[b - 1] !== '-' && res[b - 1] !== '+'))) {
      if (g === 3) {
        parts.push(res.slice(b, e));
        e = b;
        g = 1;
      } else {
        g++;
      }
      b--;
    }

    parts.push(res.slice(0, e));

    res = parts.reverse().join(groupSeparator || ' ')
  }

  if (decSeparator) {
    res = res.replace('.', decSeparator);
  }

  if (currSign) {
    if (currSignPlaceBefore) {
      res = currSign + res;
    } else {
      res = res + currSign;
    }
  }

  return res;
};

export const globalNumberFormat: INumberFormat = {

};

export interface IDateOptions {
    weekday?: 'narrow' | 'short' | 'long';
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
    day?: 'numeric' | '2-digit';
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
    second?: 'numeric' | '2-digit'
};

export interface IDateFormat {
  locales?: string;
  options?: IDateOptions;
};

export type FormatDate = (d: Date, format?: IDateFormat) => string;

export const formatDate: FormatDate = (d: Date, format?: IDateFormat): string => {
  if (format) {
    let dateTimeFormat = new Intl.DateTimeFormat(format.locales, format.options);
     return dateTimeFormat.format(d);
    }
  return d.toString();
};

export const globalDateFormat: INumberFormat = {

};
