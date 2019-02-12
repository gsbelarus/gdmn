import {
  IGdmnMessageError,
  ITaskProgress,
  TTaskActionMessageData,
  TTaskActionNames,
  TTaskActionPayloadTypes,
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

interface ICmdResult<TPayload, IError = IGdmnMessageError, IMeta = { [key: string]: string | undefined }> {
  payload: TPayload;
  error?: IError;
  meta?: IMeta;
}

type TTaskCmd<TActionName extends keyof TTaskActionPayloadTypes> = ICmd<
  // TGdmnPublishMessageMeta & // todo: tmp
  { action: TTaskActionNames } & TTaskActionMessageData<TActionName> // todo: tmp // todo type test
>;

type TTaskCmdResult<
  TActionName extends keyof TTaskActionResultTypes
> = ICmdResult<// TGdmnReceivedMessageMeta & // todo: tmp
{
  result?: TTaskActionResultTypes[TActionName];
  status?: TTaskStatus;
  progress?: ITaskProgress;
  action: TTaskActionNames; // todo: tmp
}, IGdmnMessageError, { taskId: string | undefined }>;

// sign up

type TSignUpCmd = ICmd<ISignUpRequestMeta>;

type TSignUpCmdResult = ICmdResult<TSignUpResponseMeta, null>; // only protocol errors

// sign in

type TSignInCmd = ICmd<ISignInRequestMeta>;

type TSignInCmdResult = ICmdResult<TSignInResponseMeta, null>; // only protocol errors

// sign out

type TSignOutCmd = ICmd<null>;

type TSignOutCmdResult = ICmdResult<null, null>; // only protocol errors

// access token auth

type TAuthCmd = ICmd<TAccessAuthRequestMeta>;

type TAuthCmdResult = ICmdResult<IAccessAuthResponseMeta, null>; // only protocol errors

// refresh token auth

type TRefreshAuthCmd = ICmd<TRefreshAuthRequestMeta>;

type TRefreshAuthCmdResult = ICmdResult<TRefreshAuthResponseMeta, null>; // only protocol errors

// delete account

type TDeleteAccountCmd = ICmd<TAccountDeleteRequestMeta>;

type TDeleteAccountCmdResult = ICmdResult<TAccountDeleteResponseMeta, null>; // only protocol errors

// interrupt

type TInterruptTaskCmd = TTaskCmd<TTaskActionNames.INTERRUPT>;

type TInterruptTaskCmdResult = TTaskCmdResult<TTaskActionNames.INTERRUPT>;

// reload schema

type TReloadSchemaTaskCmd  = TTaskCmd<TTaskActionNames.RELOAD_SCHEMA>;

type TReloadSchemaTaskCmdResult = TTaskCmdResult<TTaskActionNames.RELOAD_SCHEMA>;

// ping task

type TPingTaskCmd = TTaskCmd<TTaskActionNames.PING>;

type TPingTaskCmdResult = TTaskCmdResult<TTaskActionNames.PING>;

// get schema task

type TGetSchemaTaskCmd = TTaskCmd<TTaskActionNames.GET_SCHEMA>;

type TGetSchemaTaskCmdResult = TTaskCmdResult<TTaskActionNames.GET_SCHEMA>;

// query

type TQueryTaskCmd = TTaskCmd<TTaskActionNames.QUERY>;

type TQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.QUERY>;

// fetch query

type TFetchQueryTaskCmd = TTaskCmd<TTaskActionNames.FETCH_QUERY>;

type TFetchQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.FETCH_QUERY>;

// create app task

type TCreateAppTaskCmd = TTaskCmd<TTaskActionNames.CREATE_APP>;

type TCreateAppTaskCmdResult = TTaskCmdResult<TTaskActionNames.CREATE_APP>;

// delete app task

type TDeleteAppTaskCmd = TTaskCmd<TTaskActionNames.DELETE_APP>;

type TDeleteAppTaskCmdResult = TTaskCmdResult<TTaskActionNames.DELETE_APP>;

// get apps task

type TGetAppsTaskCmd = TTaskCmd<TTaskActionNames.GET_SCHEMA>;

type TGetAppsTaskCmdResult = TTaskCmdResult<TTaskActionNames.GET_SCHEMA>;

export {
  TTaskCmd,
  TTaskCmdResult,
  TSignUpCmd,
  TSignUpCmdResult,
  TSignInCmd,
  TSignInCmdResult,
  TSignOutCmd,
  TSignOutCmdResult,
  TAuthCmd,
  TAuthCmdResult,
  TRefreshAuthCmd,
  TRefreshAuthCmdResult,
  TDeleteAccountCmd,
  TDeleteAccountCmdResult,
  TInterruptTaskCmd,
  TInterruptTaskCmdResult,
  TReloadSchemaTaskCmd,
  TReloadSchemaTaskCmdResult,
  TPingTaskCmd,
  TPingTaskCmdResult,
  TGetSchemaTaskCmd,
  TGetSchemaTaskCmdResult,
  TQueryTaskCmd,
  TQueryTaskCmdResult,
  TFetchQueryTaskCmd,
  TFetchQueryTaskCmdResult,
  TCreateAppTaskCmd,
  TCreateAppTaskCmdResult,
  TDeleteAppTaskCmd,
  TDeleteAppTaskCmdResult,
  TGetAppsTaskCmd,
  TGetAppsTaskCmdResult,
  ICmdResult
};
