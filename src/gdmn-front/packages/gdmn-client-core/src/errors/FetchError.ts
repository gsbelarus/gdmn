import ExtendableError from 'es6-error';

class FetchError extends ExtendableError {
  private origError: Error;

  constructor(origError: Error, message?: string) {
    super(message || 'Не удалось установить соединие с сервером'); // `Network request to server failed`

    this.origError = origError;
    // this.statusCode = statusCode;
    // this.statusMessage = statusMessage;
  }

  public toString() {
    return this.message;
  }
}

export { FetchError };
