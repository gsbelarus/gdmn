import { formatNumber, formatDate } from "../src/format";

describe('format', () => {

  it('format number', () => {
    expect(formatNumber(1)).toEqual('1');
    expect(formatNumber(1.01,    { minDecDigits: 2 })).toEqual('1.01');
    expect(formatNumber(1,       { minDecDigits: 2 })).toEqual('1.00');
    expect(formatNumber(1.001,   { minDecDigits: 2 })).toEqual('1.001');

    expect(formatNumber(1,       { })).toEqual('1');
    expect(formatNumber(1,       { minIntDigits: 1 })).toEqual('1');
    expect(formatNumber(1,       { minIntDigits: 4 })).toEqual('0001');
    expect(formatNumber(1234,    { minIntDigits: 4 })).toEqual('1234');
    expect(formatNumber(12345,   { minIntDigits: 4 })).toEqual('12345');

    expect(formatNumber(1.01,    { maxDecDigits: 2 })).toEqual('1.01');
    expect(formatNumber(1,       { maxDecDigits: 2 })).toEqual('1');
    expect(formatNumber(1.001,   { maxDecDigits: 2 })).toEqual('1.00');

    expect(formatNumber(1.01,    { maxDecDigits: 0 })).toEqual('1');

    expect(formatNumber(1.01,    { minDecDigits: 2, maxDecDigits: 4 })).toEqual('1.01');
    expect(formatNumber(1,       { minDecDigits: 2, maxDecDigits: 4 })).toEqual('1.00');
    expect(formatNumber(1.001,   { minDecDigits: 2, maxDecDigits: 4 })).toEqual('1.001');
    expect(formatNumber(1.0001,  { minDecDigits: 2, maxDecDigits: 4 })).toEqual('1.0001');
    expect(formatNumber(1.00001, { minDecDigits: 2, maxDecDigits: 4 })).toEqual('1.0000');

    expect(formatNumber(1.01,    { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 5, decSeparator: ',' })).toEqual('00001,01');
    expect(formatNumber(1.01,    { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: ' BYN' })).toEqual('1.01 BYN');
    expect(formatNumber(1.01,    { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true })).toEqual('$ 1.01');
    expect(formatNumber(1.01,    { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: ' E', currSignPlaceBefore: false })).toEqual('1.01 E');

    expect(formatNumber(123456789.00001,   { minDecDigits: 2, maxDecDigits: 4, useGrouping: true })).toEqual('123 456 789.0000');
    expect(formatNumber(123456789.00001,   { minDecDigits: 2, maxDecDigits: 4, useGrouping: false, groupSeparator: ' ' })).toEqual('123456789.0000');
    expect(formatNumber(123456789.00001,   { minDecDigits: 2, maxDecDigits: 4, useGrouping: true, groupSeparator: ' ' })).toEqual('123 456 789.0000');
    expect(formatNumber(123456789.00001,   { minDecDigits: 2, maxDecDigits: 4, useGrouping: true, groupSeparator: ',' })).toEqual('123,456,789.0000');
    expect(formatNumber(1.01,              { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 5, decSeparator: ',', useGrouping: true, groupSeparator: ' ' })).toEqual('00 001,01');
    expect(formatNumber(12345678912585.01, { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: ' BYN', useGrouping: true, groupSeparator: ' ' })).toEqual('12 345 678 912 585.01 BYN');
    expect(formatNumber(1.1135,            { minDecDigits: 2, maxDecDigits: 2, minIntDigits: 1, currSign: ' BYN', useGrouping: true, groupSeparator: ' ' })).toEqual('1.11 BYN');
    expect(formatNumber(0.01111,           { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: false, groupSeparator: ' ' })).toEqual('$ 0.0111');
    expect(formatNumber(0.01111,           { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: true, groupSeparator: ' ' })).toEqual('$ 0.0111');
    expect(formatNumber(1234560.01111,     { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: false, groupSeparator: ' ' })).toEqual('$ 1234560.0111');
    expect(formatNumber(1234560.01111,     { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: true, groupSeparator: ',' })).toEqual('$ 1,234,560.0111');
    expect(formatNumber(234560.01111,      { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: true, groupSeparator: ' ' })).toEqual('$ 234 560.0111');

    expect(formatNumber(234560,            { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: true, groupSeparator: ' ' })).toEqual('$ 234 560.00');

    expect(formatNumber(-123456789.00001,  { minDecDigits: 2, maxDecDigits: 4, useGrouping: true })).toEqual('-123 456 789.0000');
    expect(formatNumber(-123456789.00001,  { minDecDigits: 2, maxDecDigits: 4, useGrouping: true, groupSeparator: ',' })).toEqual('-123,456,789.0000');
    expect(formatNumber(-12345678912585.01,{ minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: ' BYN', useGrouping: true, groupSeparator: ' ' })).toEqual('-12 345 678 912 585.01 BYN');
    expect(formatNumber(-0.01111,          { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: true, groupSeparator: ' ' })).toEqual('$ -0.0111');
    expect(formatNumber(-1234560.01111,    { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: true, groupSeparator: ',' })).toEqual('$ -1,234,560.0111');
    expect(formatNumber(-234560.01111,     { minDecDigits: 2, maxDecDigits: 4, minIntDigits: 1, currSign: '$ ', currSignPlaceBefore: true, useGrouping: true, groupSeparator: ' ' })).toEqual('$ -234 560.0111');
  });

  it('format date', () => {
    const d = new Date(2012, 5, 8);
    expect(formatDate(d, 'dd.mm.yyyy')).toEqual('08.06.2012');
    expect(formatDate(d, 'dd.mm.yy')).toEqual('08.06.12');
  });

});
