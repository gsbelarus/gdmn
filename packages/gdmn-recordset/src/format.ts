import { INumberFormat, IDateFormat } from "gdmn-internals";

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

    if (maxDecDigits || maxDecDigits === 0) {
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
  useGrouping: true
};

export const globalCurrencyFormat: INumberFormat = {
  maxDecDigits: 2,
  useGrouping: true
};

export type FormatDate = (d: Date, format?: IDateFormat) => string;

export const formatDate: FormatDate = (d: Date, format?: IDateFormat): string => {
  if (format === 'dd.mm.yy') {
    return d.getDate().toString().padStart(2, '0') + '.'
      + (d.getMonth() + 1).toString().padStart(2, '0') + '.'
      + d.getFullYear().toString().substring(2);
  }
  if (format === 'dd.mm.yyyy') {
    return d.getDate().toString().padStart(2, '0') + '.'
      + (d.getMonth() + 1).toString().padStart(2, '0') + '.'
      + d.getFullYear().toString();
  }
  if (format) {
    throw new Error(`Unknown date format string ${format}`);
  }
  return d.toString();
};

export const globalDateFormat: IDateFormat = 'dd.mm.yy';
