export interface IError {
  message?: string;
  name?: string;
  code?: string;
  stack?: string;
}

export interface IErrorMessageControl<T extends IError = Error> {
  (err: T): string | string;
}

export interface IExpectedErrorOptions<T extends IError = Error> {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  error?: new <T extends IError>() => T;
  /**
   * You can _prepend_ a static string to the error message's
   * "message" or instead have the error passed into a function
   * to generate the message.
   */
  message?: IErrorMessageControl<T>;
  /**
   * Set to true if this error should be thrown in the event of
   * and unhandled error.
   */
  isDefault?: boolean;
}
