export enum ErrorCode {
  INTERNAL,
  UNSUPPORTED,
  UNAUTHORIZED,
  INVALID,
  NOT_FOUND,
  NOT_UNIQUE
}

export class ServerError extends Error {

  private readonly _code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this._code = code;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  get code(): ErrorCode {
    return this._code;
  }
}
