import { IFieldAggregator, IDataRow } from "./types";

export interface INumAggregatorAccumulator {
  v: number | null,
  c: number
};

export function getSumAggregator(): IFieldAggregator<number | null, number> {
  return {
    init: () => null,
    processRow: (row: IDataRow, fieldName: string, acc: number | null) => typeof row[fieldName] !== 'number' ? acc : (acc ? acc : 0) + (row[fieldName] as number),
    getTotal: (acc: number | null) => acc
  };
};

export function getAvgAggregator(): IFieldAggregator<INumAggregatorAccumulator, number> {
  return {
    init: () => ({ v: null, c: 0 }),
    processRow: (row: IDataRow, fieldName: string, acc: INumAggregatorAccumulator) => ({
      v: typeof row[fieldName] !== 'number' ? acc.v : (acc.v ? acc.v : 0) + (row[fieldName] as number),
      c: acc.c + 1
    }),
    getTotal: (acc: INumAggregatorAccumulator) => acc.v === null ? null : acc.v / acc.c
  };
};