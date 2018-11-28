import { IEntityQueryInspector, IERModel, IQueryResponse } from 'gdmn-orm';

import { IReceivedErrorMeta, TPublishMessageMeta, TReceivedMessageMeta } from './protocol';

enum TGdmnTopic {
  TASK = '/task',
  TASK_STATUS = '/task/status',
  TASK_PROGRESS = '/task/progress'
}

// MESSAGES META

// type TGdmnActionType = TTaskActionNames;
type TGdmnPublishMessageMeta = TPublishMessageMeta<TTaskActionNames>;
type TGdmnReceivedMessageMeta = TReceivedMessageMeta<TTaskActionNames>;
type TGdmnReceivedErrorMeta = IReceivedErrorMeta<TGdmnErrorCodes>;

// -- error
const enum TGdmnErrorCodes {
  INTERNAL = '0',
  UNSUPPORTED = '1',
  UNAUTHORIZED = '2',
  INVALID = '3',
  NOT_FOUND = '4',
  NOT_UNIQUE = '5'
}
// -- task
const enum TTaskActionNames {
  PING = 'PING',
  GET_SCHEMA = 'GET_SCHEMA',
  QUERY = 'QUERY',
  DELETE_APP = 'DELETE_APP',
  CREATE_APP = 'CREATE_APP',
  GET_APPS = 'GET_APPS'
}

// MESSAGES DATA

interface IGdmnMessageData<TPayload = any> {
  payload: TPayload;
}

interface IGdmnMessageReply<TResult = any, TPayload = any, TErrorCode = number> extends IGdmnMessageData<TPayload> {
  result: TResult;
  error: IGdmnMessageError<TErrorCode>;
}

interface IGdmnMessageError<TErrorCode = string> {
  code: TErrorCode;
  message: string;
}

// -- TASK-ACTION
// pub: /task

type TTaskActionMessageData<TActionName extends keyof TTaskActionPayloadTypes> = IGdmnMessageData<
  TTaskActionPayloadTypes[TActionName]
>;

interface TTaskActionPayloadTypes {
  [TTaskActionNames.PING]: {
    steps: number;
    delay: number;
  };
  [TTaskActionNames.GET_SCHEMA]: undefined;
  [TTaskActionNames.QUERY]: IEntityQueryInspector;
  [TTaskActionNames.CREATE_APP]: {
    alias: string;
    connectionOptions?: {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      path?: string;
    };
  };
  [TTaskActionNames.DELETE_APP]: {
    uid: string;
  };
  [TTaskActionNames.GET_APPS]: undefined;
}

// -- TASK-RESULT
// sub: /task

type TTaskResultMessageData<TActionName extends keyof TTaskActionResultTypes> = IGdmnMessageReply<
  TTaskActionResultTypes[TActionName],
  TTaskActionPayloadTypes[TActionName]
> & {
  status: TTaskStatus; // TTaskFinishStatus;
};

interface TTaskActionResultTypes {
  [TTaskActionNames.PING]: undefined;
  [TTaskActionNames.GET_SCHEMA]: IERModel;
  [TTaskActionNames.QUERY]: IQueryResponse;
  [TTaskActionNames.CREATE_APP]: IApplicationInfo;
  [TTaskActionNames.DELETE_APP]: undefined;
  [TTaskActionNames.GET_APPS]: any; // fixme: type in api.getApps IApplicationInfo[];
}

interface IApplicationInfo {
  uid: string;
  alias: string;
  creationDate: Date;
}

const enum TTaskFinishStatus {
  INTERRUPTED = 3,
  ERROR = 4,
  DONE = 5
}

// -- TASK-STATUS
// sub: /task/status

interface ITaskStatusMessageData<TActionName extends keyof TTaskActionPayloadTypes>
  extends TTaskActionMessageData<TActionName> {
  status: TTaskStatus;
}

const enum TTaskStatus {
  RUNNING = 1,
  PAUSED = 2,
  INTERRUPTED = 3,
  ERROR = 4,
  DONE = 5
}

// -- TASK-PROGRESS
// sub: /task/progress

interface ITaskProgressMessageData<TActionName extends keyof TTaskActionPayloadTypes>
  extends TTaskActionMessageData<TActionName> {
  progress: ITaskProgress;
}

interface ITaskProgress {
  value: number; // 0-100
  description: string;
}

export {
  TGdmnTopic,
  TGdmnPublishMessageMeta,
  TGdmnReceivedMessageMeta,
  TGdmnReceivedErrorMeta,
  TGdmnErrorCodes,
  TTaskActionNames,
  IGdmnMessageData,
  IGdmnMessageReply,
  IGdmnMessageError,
  TTaskActionMessageData,
  TTaskActionPayloadTypes,
  TTaskResultMessageData,
  TTaskActionResultTypes,
  IApplicationInfo,
  ITaskStatusMessageData,
  TTaskStatus,
  ITaskProgressMessageData,
  ITaskProgress
};
