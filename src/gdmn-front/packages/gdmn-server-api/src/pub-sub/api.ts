import {
  IEntityInsertInspector,
  IEntityUpdateInspector,
  IEntityDeleteInspector,
  IEntityQueryInspector,
  IEntityQueryResponse,
  IERModel,
  ISequenceQueryInspector,
  ISequenceQueryResponse,
  IEntityQuerySetInspector,
  IEntityQuerySetResponse,
  IAttribute,
  IEntity
} from 'gdmn-orm';

import { IReceivedErrorMeta, TPublishMessageMeta, TReceivedMessageMeta } from './protocol';
import { ISqlQueryResponseAliases, ISettingParams, ISettingEnvelope, ISqlPrepareResponse } from 'gdmn-internals';

export enum TGdmnTopic {
  TASK = '/task',
  TASK_STATUS = '/task/status',
  TASK_PROGRESS = '/task/progress'
}

// MESSAGES META

// type TGdmnActionType = TTaskActionNames;
export type TGdmnPublishMessageMeta = TPublishMessageMeta<TTaskActionNames>;
export type TGdmnReceivedMessageMeta = TReceivedMessageMeta<TTaskActionNames>;
export type TGdmnReceivedErrorMeta = IReceivedErrorMeta<TGdmnErrorCodes>;

// -- error
export const enum TGdmnErrorCodes {
  INTERNAL = '0',
  UNSUPPORTED = '1',
  UNAUTHORIZED = '2',
  INVALID = '3',
  NOT_FOUND = '4',
  NOT_UNIQUE = '5'
}
// -- task
export const enum TTaskActionNames {
  DEMO = 'DEMO',
  QUERY = 'QUERY',
  QUERY_SET = 'QUERY_SET',
  SQL_QUERY = 'SQL_QUERY',
  SQL_PREPARE = 'SQL_PREPARE',
  PREPARE_QUERY = 'PREPARE_QUERY',
  PREPARE_SQL_QUERY = 'PREPARE_SQL_QUERY',
  FETCH_QUERY = 'FETCH_QUERY',
  FETCH_SQL_QUERY = 'FETCH_SQL_QUERY',
  INTERRUPT = 'INTERRUPT',
  RELOAD_SCHEMA = 'RELOAD_SCHEMA',
  PING = 'PING',
  GET_SCHEMA = 'GET_SCHEMA',
  DEFINE_ENTITY = 'DEFINE_ENTITY',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DELETE_APP = 'DELETE_APP',
  CREATE_APP = 'CREATE_APP',
  GET_APPS = 'GET_APPS',
  GET_APP_TEMPLATES = 'GET_APP_TEMPLATES',
  SEQUENCE_QUERY = 'SEQUENCE_QUERY',
  GET_SESSIONS_INFO = 'GET_SESSIONS_INFO',
  GET_MAIN_SESSIONS_INFO = 'GET_MAIN_SESSIONS_INFO',
  GET_NEXT_ID = 'GET_NEXT_ID',
  ADD_ENTITY = 'ADD_ENTITY',
  DELETE_ENTITY = 'DELETE_ENTITY',
  DELETE_ATTRIBUTE = 'DELETE_ATTRIBUTE',
  QUERY_SETTING = 'QUERY_SETTING',
  SAVE_SETTING = 'SAVE_SETTING',
  DELETE_SETTING = 'DELETE_SETTING'
}

// MESSAGES DATA

export interface IGdmnMessageData<TPayload = any> {
  payload: TPayload;
}

export interface IGdmnMessageReply<TResult = any, TPayload = any, TErrorCode = string> extends IGdmnMessageData<TPayload> {
  result: TResult;
  error: IGdmnMessageError<TErrorCode>;
}

export interface IGdmnMessageError<TErrorCode = string> {
  code: TErrorCode;
  message: string;
}

// -- TASK-ACTION
// pub: /task

export type TTaskActionMessageData<TActionName extends keyof TTaskActionPayloadTypes> = IGdmnMessageData<
  TTaskActionPayloadTypes[TActionName]
>;

export interface TTaskActionPayloadTypes {
  [TTaskActionNames.DEMO]: {
    withError: boolean;
  };
  [TTaskActionNames.QUERY]: {
    query: IEntityQueryInspector;
  };
  [TTaskActionNames.QUERY_SET]: {
    querySet: IEntityQuerySetInspector;
  };
  [TTaskActionNames.SQL_QUERY]: {
    select: string;
    params: {[alias: string]: any}
  };
  [TTaskActionNames.SQL_PREPARE]: {
    sql: string;
  };
  [TTaskActionNames.PREPARE_QUERY]: {
    query: IEntityQueryInspector;
  };
  [TTaskActionNames.PREPARE_SQL_QUERY]: {
    select: string;
    params: {[alias: string]: any}
  };
  [TTaskActionNames.FETCH_QUERY]: {
    taskKey: string;
    rowsCount: number;
  };
  [TTaskActionNames.FETCH_SQL_QUERY]: {
    taskKey: string;
    rowsCount: number;
  };
  [TTaskActionNames.INTERRUPT]: {
    taskKey: string;
  };
  [TTaskActionNames.RELOAD_SCHEMA]: {
    withAdapter: boolean;
  };
  [TTaskActionNames.PING]: {
    steps: number;
    delay: number;
    testChildProcesses: boolean
  };
  [TTaskActionNames.GET_SCHEMA]: {
    withAdapter: boolean;
  };
  [TTaskActionNames.DEFINE_ENTITY]: {
    entity: string;
    pkValues: any[];
  };
  [TTaskActionNames.INSERT]: {
    insert: IEntityInsertInspector;
  };
  [TTaskActionNames.UPDATE]: {
    update: IEntityUpdateInspector;
  };
  [TTaskActionNames.DELETE]: {
    delete: IEntityDeleteInspector;
  };
  [TTaskActionNames.CREATE_APP]: ICreateApplicationInfo;
  [TTaskActionNames.DELETE_APP]: {
    uid: string;
  };
  [TTaskActionNames.GET_APPS]: undefined;
  [TTaskActionNames.GET_APP_TEMPLATES]: undefined;
  [TTaskActionNames.SEQUENCE_QUERY]: {
    query: ISequenceQueryInspector;
  };
  [TTaskActionNames.GET_SESSIONS_INFO]: {
    withError: boolean;
  };
  [TTaskActionNames.GET_MAIN_SESSIONS_INFO]: {
  };
  [TTaskActionNames.GET_NEXT_ID]: {
  };
  [TTaskActionNames.ADD_ENTITY]: IEntity;
  [TTaskActionNames.DELETE_ENTITY]: {
    entityName: string;
  };
  [TTaskActionNames.DELETE_ATTRIBUTE]: {
    entityData: IEntity;
    attrName: string;
  };
  [TTaskActionNames.QUERY_SETTING]: {query: ISettingParams[]};
  [TTaskActionNames.SAVE_SETTING]: {newData: ISettingEnvelope};
  [TTaskActionNames.DELETE_SETTING]: {data: ISettingParams};
}

// -- TASK-RESULT
// sub: /task

export type TTaskResultMessageData<TActionName extends keyof TTaskActionResultTypes> = IGdmnMessageReply<
  TTaskActionResultTypes[TActionName],
  TTaskActionPayloadTypes[TActionName]
> & {
  status: TTaskStatus; // TTaskFinishStatus;
};

export interface TTaskActionResultTypes {
  [TTaskActionNames.DEMO]: undefined;
  [TTaskActionNames.QUERY]: IEntityQueryResponse;
  [TTaskActionNames.QUERY_SET]: IEntityQuerySetResponse;
  [TTaskActionNames.SQL_QUERY]: ISqlQueryResponse;
  [TTaskActionNames.SQL_PREPARE]: ISqlPrepareResponse;
  [TTaskActionNames.PREPARE_QUERY]: undefined;
  [TTaskActionNames.PREPARE_SQL_QUERY]: undefined;
  [TTaskActionNames.FETCH_QUERY]: IEntityQueryResponse;
  [TTaskActionNames.FETCH_SQL_QUERY]: ISqlQueryResponse;
  [TTaskActionNames.INTERRUPT]: undefined;
  [TTaskActionNames.RELOAD_SCHEMA]: IERModel;
  [TTaskActionNames.PING]: undefined;
  [TTaskActionNames.GET_SCHEMA]: IERModel;
  [TTaskActionNames.DEFINE_ENTITY]: IDefinedEntity;
  [TTaskActionNames.INSERT]: undefined;
  [TTaskActionNames.UPDATE]: undefined;
  [TTaskActionNames.DELETE]: undefined;
  [TTaskActionNames.CREATE_APP]: IApplicationInfo;
  [TTaskActionNames.DELETE_APP]: undefined;
  [TTaskActionNames.GET_APPS]: IApplicationInfo[];
  [TTaskActionNames.GET_APP_TEMPLATES]: ITemplateApplication[];
  [TTaskActionNames.SEQUENCE_QUERY]: ISequenceQueryResponse;
  [TTaskActionNames.GET_SESSIONS_INFO]: ISessionInfo[];
  [TTaskActionNames.GET_MAIN_SESSIONS_INFO]: any[];
  [TTaskActionNames.GET_NEXT_ID]: INextId;
  [TTaskActionNames.ADD_ENTITY]: IEntity;
  [TTaskActionNames.DELETE_ENTITY]: IDeleteEntity;
  [TTaskActionNames.DELETE_ATTRIBUTE]: void;
  [TTaskActionNames.QUERY_SETTING]: ISettingEnvelope[];
  [TTaskActionNames.SAVE_SETTING]: void;
  [TTaskActionNames.DELETE_SETTING]: void;
}

export interface ISqlQueryResponseDataItem {
  [alias: string]: any;
}

export interface ISessionInfo {
  database: string;
  id: string;
  user: number;
  transactions?: number;
  sql?: string;
  usesConnections?: number[];
  tasks?: ITask[];
}

export interface INextId {
  id: number;
}

export interface ITask {
  id: string;
  status: TTaskStatus;
  command?: ICmd<AppAction, any>;
}

export interface ICmd<A, P = any> {
  readonly id?: string;
  readonly replyMode?: boolean;
  readonly action: A;
  readonly payload: P;
}

export type AppAction =
  "DEMO"
  | "PING"
  | "INTERRUPT"
  | "RELOAD_SCHEMA"
  | "GET_SCHEMA"
  | "DEFINE_ENTITY"
  | "QUERY"
  | "QUERY_SET"
  | "SQL_QUERY"
  | "SQL_PREPARE"
  | "PREPARE_QUERY"
  | "PREPARE_SQL_QUERY"
  | "FETCH_QUERY"
  | "FETCH_SQL_QUERY"
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "SEQUENCE_QUERY"
  | "GET_SESSIONS_INFO"
  | "GET_NEXT_ID"
  | "ADD_ENTITY"
  | "DELETE_ENTITY"
  | "DELETE_ATTRIBUTE"
  | "QUERY_SETTING"
  | "SAVE_SETTING";

export interface ISqlQueryResponse {
  data: ISqlQueryResponseDataItem[];
  aliases: ISqlQueryResponseAliases;
}

export interface IAddEntity {
  entityName: string;
  parentName?: string;
  attributes?: IAttribute[]
}

export interface IDeleteEntity {
  entityName: string;
}

export interface IDefinedEntity {
  entity: string;
}

export interface IConnectionOptions {
  server?: {
    host: string;
    port: number;
  };
  username?: string;
  password?: string;
  path?: string;
}

export interface ICreateApplicationInfo {
  alias: string;
  external: boolean;
  connectionOptions?: IConnectionOptions;
  template?: string;
}

export interface IApplicationInfo extends IConnectionOptions {
  id: number;
  uid: string;
  alias: string;
  ownerKey: number;
  external: boolean;
  creationDate: Date;
}

export interface ITemplateApplication {
  name: string;
  description: string;
}

export const TTaskFinishStatus = [TTaskStatus.INTERRUPTED, TTaskStatus.FAILED, TTaskStatus.SUCCESS];

// -- TASK-STATUS
// sub: /task/status

export interface ITaskStatusMessageData<TActionName extends keyof TTaskActionPayloadTypes>
  extends TTaskActionMessageData<TActionName> {
  status: TTaskStatus;
}

export const enum TTaskStatus {
  RUNNING = 1,
  PAUSED = 2,
  INTERRUPTED = 3,
  FAILED = 4,
  SUCCESS = 5
}

// -- TASK-PROGRESS
// sub: /task/progress

export interface ITaskProgressMessageData<TActionName extends keyof TTaskActionPayloadTypes>
  extends TTaskActionMessageData<TActionName> {
  progress: ITaskProgress;
  status: TTaskStatus;
}

export interface ITaskProgress {
  min: number;
  max: number;
  value: number; // 0-100
  description: string;
}
