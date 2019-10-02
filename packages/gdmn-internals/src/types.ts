import { isValidDate } from "./utils"

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
};

export function isISettingData(data: any): data is ISettingData {
  return (
    data instanceof Object
    &&
    typeof data.type === 'string'
    &&
    typeof data.objectID === 'string'
  )
};

export interface ISettingEnvelope extends ISettingData {
  _changed: number;
  _accessed: number;
};

export function isISettingEnvelope(data: any): data is ISettingEnvelope {
  return (
    isISettingData(data)
    &&
    typeof (data as any)._changed === 'number'
    &&
    typeof (data as any)._accessed === 'number'
  )
};
