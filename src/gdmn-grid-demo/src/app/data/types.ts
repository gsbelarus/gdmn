import { RecordSet } from "gdmn-recordset";

export type RSCreateFunc = (rs: RecordSet) => void;

export interface IDemoRecordSet {
  name: string,
  createFunc: (name: string, rscf: RSCreateFunc) => void
};