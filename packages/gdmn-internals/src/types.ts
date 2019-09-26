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

export interface IFieldDescription {
  name: string,
  type: Types
}

export interface ISqlPrepareResponse {
  plan?: string;
  fieldList?: IFieldDescription[],
  paramList?: IFieldDescription[];
}

export interface ISettingParams {
  type: string;
  objectID: string;
  userID?: string;
  userGroupsIDs?: string[];
  appID?: string;
  organizationID?: string;
  mediaQuery?: string;
};

export interface ISettingData extends ISettingParams {
  data: any;
}

export interface ISettingEnvelope extends ISettingData {
  _changed: Date;
  _accessed: Date;
};
