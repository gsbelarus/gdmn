import {
  IGdmnMessageError,
  ITaskProgress,
  TTaskActionMessageData,
  TTaskActionNames,
  TTaskActionResultTypes,
  TTaskStatus
} from './api';
import {
  IAccessAuthResponseMeta,
  ISignInRequestMeta,
  ISignUpRequestMeta,
  TAccessAuthRequestMeta,
  TAccountDeleteRequestMeta,
  TAccountDeleteResponseMeta,
  TRefreshAuthRequestMeta,
  TRefreshAuthResponseMeta,
  TSignInResponseMeta,
  TSignUpResponseMeta
} from './protocol';

interface ICmd<TPayload> {
  payload: TPayload;
}

export interface ICmdResult<TPayload, IError = IGdmnMessageError, IMeta = { [key: string]: string | undefined }> {
  payload: TPayload;
  error?: IError;
  meta?: IMeta;
}

// TGdmnPublishMessageMeta & // todo: tmp
export type TTaskCmd<TActionName extends TTaskActionNames> =
  ICmd<{ action: TActionName } & TTaskActionMessageData<TActionName>>;

// TGdmnReceivedMessageMeta & // todo: tmp
export type TTaskCmdResult<TActionName extends TTaskActionNames> =
  ICmdResult<
{
  result?: TTaskActionResultTypes[TActionName];
  status: TTaskStatus;
  progress?: ITaskProgress;
  action: TActionName;
}, IGdmnMessageError, { taskKey: string | undefined }>;

// sign up

export type TSignUpCmd = ICmd<ISignUpRequestMeta>;

export type TSignUpCmdResult = ICmdResult<TSignUpResponseMeta, null>; // only protocol errors

// sign in

export type TSignInCmd = ICmd<ISignInRequestMeta>;

export type TSignInCmdResult = ICmdResult<TSignInResponseMeta, null>; // only protocol errors

// sign out

export type TSignOutCmd = ICmd<null>;

export type TSignOutCmdResult = ICmdResult<null, null>; // only protocol errors

// access token auth

export type TAuthCmd = ICmd<TAccessAuthRequestMeta>;

export type TAuthCmdResult = ICmdResult<IAccessAuthResponseMeta, null>; // only protocol errors

// refresh token auth

export type TRefreshAuthCmd = ICmd<TRefreshAuthRequestMeta>;

export type TRefreshAuthCmdResult = ICmdResult<TRefreshAuthResponseMeta, null>; // only protocol errors

// delete account

export type TDeleteAccountCmd = ICmd<TAccountDeleteRequestMeta>;

export type TDeleteAccountCmdResult = ICmdResult<TAccountDeleteResponseMeta, null>; // only protocol errors

// interrupt

export type TInterruptTaskCmd = TTaskCmd<TTaskActionNames.INTERRUPT>;

export type TInterruptTaskCmdResult = TTaskCmdResult<TTaskActionNames.INTERRUPT>;

// reload schema

export type TReloadSchemaTaskCmd  = TTaskCmd<TTaskActionNames.RELOAD_SCHEMA>;

export type TReloadSchemaTaskCmdResult = TTaskCmdResult<TTaskActionNames.RELOAD_SCHEMA>;

// demo task

export type TDemoTaskCmd = TTaskCmd<TTaskActionNames.DEMO>;

export type TDemoTaskCmdResult = TTaskCmdResult<TTaskActionNames.DEMO>;

// ping task

export type TPingTaskCmd = TTaskCmd<TTaskActionNames.PING>;

export type TPingTaskCmdResult = TTaskCmdResult<TTaskActionNames.PING>;

// get schema task

export type TGetSchemaTaskCmd = TTaskCmd<TTaskActionNames.GET_SCHEMA>;

export type TGetSchemaTaskCmdResult = TTaskCmdResult<TTaskActionNames.GET_SCHEMA>;

// define entity

export type TDefineEntityTaskCmd = TTaskCmd<TTaskActionNames.DEFINE_ENTITY>;

export type TDefineEntityTaskCmdResult = TTaskCmdResult<TTaskActionNames.DEFINE_ENTITY>;

// query

export type TQueryTaskCmd = TTaskCmd<TTaskActionNames.QUERY>;

export type TQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.QUERY>;

export type TSqlQueryTaskCmd = TTaskCmd<TTaskActionNames.SQL_QUERY>;

export type TSqlQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.SQL_QUERY>;

// prepare query

export type TPrepareQueryTaskCmd = TTaskCmd<TTaskActionNames.PREPARE_QUERY>;

export type TPrepareQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.PREPARE_QUERY>;

export type TPrepareSqlQueryTaskCmd = TTaskCmd<TTaskActionNames.PREPARE_SQL_QUERY>;

export type TPrepareSqlQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.PREPARE_SQL_QUERY>;

// fetch query

export type TFetchQueryTaskCmd = TTaskCmd<TTaskActionNames.FETCH_QUERY>;

export type TFetchQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.FETCH_QUERY>;

export type TFetchSqlQueryTaskCmd = TTaskCmd<TTaskActionNames.FETCH_SQL_QUERY>;

export type TFetchSqlQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.FETCH_SQL_QUERY>;

// insert item

export type TInsertTaskCmd = TTaskCmd<TTaskActionNames.INSERT>;

export type TInsertTaskCmdResult = TTaskCmdResult<TTaskActionNames.INSERT>;

// update item

export type TUpdateTaskCmd = TTaskCmd<TTaskActionNames.UPDATE>;

export type TUpdateTaskCmdResult = TTaskCmdResult<TTaskActionNames.UPDATE>;

// delete item

export type TDeleteTaskCmd = TTaskCmd<TTaskActionNames.DELETE>;

export type TDeleteTaskCmdResult = TTaskCmdResult<TTaskActionNames.DELETE>;

// create app task

export type TCreateAppTaskCmd = TTaskCmd<TTaskActionNames.CREATE_APP>;

export type TCreateAppTaskCmdResult = TTaskCmdResult<TTaskActionNames.CREATE_APP>;

// delete app task

export type TDeleteAppTaskCmd = TTaskCmd<TTaskActionNames.DELETE_APP>;

export type TDeleteAppTaskCmdResult = TTaskCmdResult<TTaskActionNames.DELETE_APP>;

// get apps task

export type TGetAppsTaskCmd = TTaskCmd<TTaskActionNames.GET_APPS>;

export type TGetAppsTaskCmdResult = TTaskCmdResult<TTaskActionNames.GET_APPS>;

// get app templates

export type TGetAppTemplatesTaskCmd = TTaskCmd<TTaskActionNames.GET_APP_TEMPLATES>;

export type TGetAppTemplatesTaskCmdResult = TTaskCmdResult<TTaskActionNames.GET_APP_TEMPLATES>;

// sequence query

export type TSequenceQueryTaskCmd = TTaskCmd<TTaskActionNames.SEQUENCE_QUERY>;

export type TSequenceQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.SEQUENCE_QUERY>;
