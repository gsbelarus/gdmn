export enum Types {
  BIGINT,
  INTEGER,
  SMALLINT,

  BLOB,
  BOOLEAN,

  CHAR,
  VARCHAR,

  DATE,
  TIME,
  TIMESTAMP,

  DOUBLE,
  FLOAT,

  NULL,

  OTHER
}

export interface ISqlQueryResponseAliasesRdb {
  type: Types;
  label?: string;
  field?: string;
  relation?: string;
}

export interface ISqlQueryResponseAliasesOrm {
  type: string;
  entity?: string;
}

export interface ISqlQueryResponseAliases {
  [alias: string]: {
    rdb: ISqlQueryResponseAliasesRdb;
    orm?: ISqlQueryResponseAliasesOrm;
  }
}
