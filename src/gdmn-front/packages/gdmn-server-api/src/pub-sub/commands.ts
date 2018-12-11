import {
  IGdmnMessageError,
  ITaskProgress,
  TGdmnPublishMessageMeta,
  TGdmnReceivedMessageMeta,
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

interface ICmdResult<TPayload, IError = IGdmnMessageError> {
  payload: TPayload;
  error?: IError;
}

type TTaskCmd<TActionName extends keyof TTaskActionPayloadTypes> = ICmd<
  TGdmnPublishMessageMeta & TTaskActionMessageData<TActionName> // todo type test
>;

type TTaskCmdResult<TActionName extends keyof TTaskActionResultTypes> = ICmdResult<
  // TGdmnReceivedMessageMeta & // todo: tmp
  {
    result?: TTaskActionResultTypes[TActionName];
    status?: TTaskStatus;
    progress?: ITaskProgress;

    action: TTaskActionNames; // todo: tmp
  }
>;

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

// ping task

type TPingTaskCmd = TTaskCmd<TTaskActionNames.PING>;

type TPingTaskCmdResult = TTaskCmdResult<TTaskActionNames.PING>;

// get schema task

type TGetSchemaTaskCmd = TTaskCmd<TTaskActionNames.GET_SCHEMA>;

type TGetSchemaTaskCmdResult = TTaskCmdResult<TTaskActionNames.GET_SCHEMA>;

// query task

type TQueryTaskCmd = TTaskCmd<TTaskActionNames.QUERY>;

type TQueryTaskCmdResult = TTaskCmdResult<TTaskActionNames.QUERY>;

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
  TPingTaskCmd,
  TPingTaskCmdResult,
  TGetSchemaTaskCmd,
  TGetSchemaTaskCmdResult,
  TQueryTaskCmd,
  TQueryTaskCmdResult,
  TCreateAppTaskCmd,
  TCreateAppTaskCmdResult,
  TDeleteAppTaskCmd,
  TDeleteAppTaskCmdResult,
  TGetAppsTaskCmd,
  TGetAppsTaskCmdResult,
  ICmdResult
};
