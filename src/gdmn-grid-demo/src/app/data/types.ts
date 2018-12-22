import { RecordSet, IDataRow } from "gdmn-recordset";

export type RSCreateFunc<R extends IDataRow = IDataRow> = (rs: RecordSet<R>) => void;

export interface IDemoRecordSet<R extends IDataRow = IDataRow> {
  name: string,
  createFunc: (name: string, rscf: RSCreateFunc<R>) => void
};