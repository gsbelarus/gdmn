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

  if (format) {    
    const { minDecDigits, maxDecDigits, useGrouping, groupSeparator, decSeparator, minIntDigits, currSign, currSignPlaceBefore } = format; 
    let res = n.toString();
    let m = res.split('.');
    if (minDecDigits !== undefined || maxDecDigits !== undefined) {   
      let c = m.length > 1 ? m[1].length : 0;

      if (minDecDigits) {
        c = Math.max(c, minDecDigits);       
      }

      if (maxDecDigits) {    
        c = Math.min(c, maxDecDigits);
      }      

      res = n.toFixed(c);
    } 

    if (minIntDigits !== undefined) {
      for (let i = minIntDigits - m[0].length; i > 0; i--) {
        res = '0' + res;
      }
    }

    if (useGrouping) {
      m = res.split('.');
      if (m[0][0] === '-') {
        res = m[0].substr(1, m[0].length)
      } else
        res = m[0];
      let j = 1;
      for (let i = res.length; i > 3; i = i-3) {
        res = res.substr(0, i - 3) + (groupSeparator == undefined ? ' ' : groupSeparator) + res.substr(i - 3, j * 3 + j);
        j = j + 1;
      }   
      if (m.length > 1) {
        res = res + '.' + m[1];
      }   
      if (m[0][0] === '-') {
        res = '-' + res
      } 
    }

    if (decSeparator) {
      res = res.replace('.', decSeparator);
    }
    
    if (currSign != undefined) {
      if (currSignPlaceBefore) {
        res = currSign + ' ' + res;
      } else {
        res = res + ' ' + currSign;
      }
    }
    return res;  
  }
  
  return n.toString();
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
