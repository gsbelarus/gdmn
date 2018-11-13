interface _IMessageMeta<TActionTypes extends string> {
  action: TActionTypes;
  [k: string]: string | undefined;
}
interface _ISignRequestMeta {
  login: string;
  passcode: string;
}
interface _ISignResponseMeta {
  session: string; // todo: || undefined (for all meta)
  'access-token': string;
  'refresh-token': string;
}
interface _IAuthRequestMeta {
  'app-uid'?: string;
  session?: string;
  authorization: string;
}

// sign up
interface ISignUpRequestMeta extends _ISignRequestMeta {
  'create-user': 1;
}
type TSignUpResponseMeta = _ISignResponseMeta;

// sign in
interface ISignInRequestMeta extends _ISignRequestMeta {
  'create-user': 0;
  'app-uid'?: string;
  session?: string;
}
type TSignInResponseMeta = _ISignResponseMeta;

// access token auth
type TAccessAuthRequestMeta = _IAuthRequestMeta;
interface IAccessAuthResponseMeta {
  session: string;
}

// refresh token auth
type TRefreshAuthRequestMeta = _IAuthRequestMeta;
type TRefreshAuthResponseMeta = _ISignResponseMeta;

// publish
type TPublishMessageMeta<TActionTypes extends string> = _IMessageMeta<TActionTypes>;

// receive
type TReceivedMessageMeta<TActionTypes extends string> = _IMessageMeta<TActionTypes>;

interface IReceivedErrorMeta<TErrorCodes extends number> {
  code: TErrorCodes;
  message: string; // todo: tmp
}

// todo reconnect (session)

export {
  ISignInRequestMeta,
  TSignInResponseMeta,
  ISignUpRequestMeta,
  TSignUpResponseMeta,
  TAccessAuthRequestMeta,
  IAccessAuthResponseMeta,
  TRefreshAuthRequestMeta,
  TRefreshAuthResponseMeta,
  TPublishMessageMeta,
  TReceivedMessageMeta,
  IReceivedErrorMeta,
  _ISignResponseMeta
};
