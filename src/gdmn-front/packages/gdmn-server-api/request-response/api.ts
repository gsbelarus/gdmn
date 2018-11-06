interface IAccountLoginRequest {
  login: string;
  password: string;
}

interface IAccountCreateRequest extends IAccountLoginRequest {
  name: string;
}

interface IAccountLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

type TAccountCreateResponse = IAccountLoginResponse;

interface IAppCreateRequest {
  alias: string;
}

interface IAppCreateResponse {
  uid: string;
}

interface IAppDeleteResponse {
  uid: string;
}

type TAppGetResponse = Array<{ uid: string; alias: string; creationDate: Date }>;

type TBackupGetResponse = Array<{ uid: string; alias: string; creationDate: Date; size: number }>;

const enum TResponseErrorCode {
  INTERNAL,
  NOT_FOUND,
  NOT_UNIQUE,
  INVALID_AUTH_TOKEN,
  INVALID_ARGUMENTS
}

interface IResponseError {
  error: string;
  stack?: string;
  originalError: {
    expose: boolean;
    statusCode: number;
    status: number;
    code?: TResponseErrorCode;
    fields?: any[];
  };
  message?: string;
}

export {
  IAccountLoginRequest,
  IAccountCreateRequest,
  IAccountLoginResponse,
  TAccountCreateResponse,
  IAppCreateRequest,
  IAppCreateResponse,
  IAppDeleteResponse,
  TAppGetResponse,
  TBackupGetResponse,
  TResponseErrorCode,
  IResponseError
};
