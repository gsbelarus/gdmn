export interface INumberFormat {
  name?: string;
  minIntDigits?: number;
  minDecDigits?: number;
  maxDecDigits?: number;
  decSeparator?: string;
  groupSeparator?: string;
  useGrouping?: boolean;
  currSign?: string;
  currSignPlaceBefore?: boolean;
};

export type IDateFormat = string;

export const dateFormats = ['', 'dd.mm.yy', 'dd.mm.yyyy'];

export interface INumberFormats {
  [name: string]: INumberFormat;
}

export const numberFormats: INumberFormats = {
  '': {}, 
  '0': {maxDecDigits: 0},
  '0.##': {maxDecDigits: 2 },
  '0.00': {maxDecDigits: 2, minDecDigits: 2},           
  '0.000': {maxDecDigits: 3, minDecDigits: 3},      
  '0.0000': {maxDecDigits: 4, minDecDigits: 4},
  '#,##0.00': {maxDecDigits: 2, minDecDigits: 2, useGrouping: true, groupSeparator: ','},
  '$#,##0.00': {maxDecDigits: 2, minDecDigits: 2, currSign: '$ ', currSignPlaceBefore: true}
}; 