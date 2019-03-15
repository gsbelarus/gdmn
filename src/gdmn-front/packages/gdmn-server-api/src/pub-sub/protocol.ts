import { IPubSubMessageMeta } from '@gdmn/client-core';

export interface _IMessageMeta<TActionTypes extends string> {
  action: TActionTypes;
  [k: string]: string | undefined;
}
export interface _ISignRequestMeta {
  login: string;
  passcode: string;
}
export interface _ISignResponseMeta {
  session: string; // todo: || undefined (for all meta)
  'access-token': string;
  'refresh-token': string;
}
export interface _IAuthRequestMeta {
  'app-uid'?: string;
  session?: string;
  authorization: string;
}

// sign up
export interface ISignUpRequestMeta extends _ISignRequestMeta {
  'create-user': 1;
}
export type TSignUpResponseMeta = _ISignResponseMeta;

// sign in
export interface ISignInRequestMeta extends _ISignRequestMeta {
  'create-user': 0;
  'app-uid'?: string;
  session?: string;
}
export type TSignInResponseMeta = _ISignResponseMeta;

// access token auth
export type TAccessAuthRequestMeta = _IAuthRequestMeta;
export interface IAccessAuthResponseMeta {
  session: string;
}

// refresh token auth
export type TRefreshAuthRequestMeta = _IAuthRequestMeta;
export type TRefreshAuthResponseMeta = _ISignResponseMeta;

// delete account
export type TAccountDeleteRequestMeta = TAccessAuthRequestMeta & {
  'delete-user': 1;
};
export type TAccountDeleteResponseMeta = IAccessAuthResponseMeta;

// publish
export type TPublishMessageMeta<TActionTypes extends string> = _IMessageMeta<TActionTypes> & {
  'reply-mode'?: '1';
};

// receive
export type TReceivedMessageMeta<TActionTypes extends string> = _IMessageMeta<TActionTypes>;

// interface IReceivedErrorMeta<TErrorCodes extends string> extends IPubSubMessageMeta {
//   code: TErrorCodes;
//   message: string;
// } //& IPubSubMessageMeta;

export type IReceivedErrorMeta<TErrorCodes extends string> = IPubSubMessageMeta & {
  code: TErrorCodes;
  message: string;
};

// todo reconnect (session)
