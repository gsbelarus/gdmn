export enum StompErrorCode {
  INTERNAL,
  UNSUPPORTED,
  UNAUTHORIZED,
  INVALID,
  NOT_FOUND,
  NOT_UNIQUE
}

export class StompServerError extends Error {

  private readonly _code: StompErrorCode;

  constructor(code: StompErrorCode, message: string) {
    super(message);
    this._code = code;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, StompServerError.prototype);
  }

  get code(): StompErrorCode {
    return this._code;
  }
}
