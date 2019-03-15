export interface IAccountLoginRequest {
  login: string;
  password: string;
}

export interface IAccountCreateRequest extends IAccountLoginRequest {
  name: string;
}

export interface IAccountLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type TAccountRefreshTokenResponse = IAccountLoginResponse;

export type TAccountCreateResponse = IAccountLoginResponse;

export interface IAppCreateRequest {
  alias: string;
}

export interface IAppCreateResponse {
  uid: string;
}

export interface IAppDeleteResponse {
  uid: string;
}

export type TAppGetResponse = Array<{ uid: string; alias: string; creationDate: Date }>;

export type TBackupGetResponse = Array<{ uid: string; alias: string; creationDate: Date; size: number }>;

export const enum TResponseErrorCode {
  INTERNAL,
  NOT_FOUND,
  NOT_UNIQUE,
  INVALID_AUTH_TOKEN,
  INVALID_ARGUMENTS
}

export interface IResponseError {
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
