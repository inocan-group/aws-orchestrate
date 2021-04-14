

export interface IBaseOptions {
  /**
   * A identier of the state definition that will be used to do not have duplicates issues
   */
  name?: string | undefined;
  /** A human readable description of the state */
  comment?: string;
}

export interface IOptionsWithInput extends IBaseOptions {
  /** A path that selects a portion of the state's input to be passed to the state's task for processing. If omitted, it has the value $ which designates the entire input. For more information, see Input and Output Processing). */
  inputPath?: string
  /** A path that selects a portion of the state's input to be passed to the state's output. If omitted, it has the value $ which designates the entire input. For more information, see Input and Output Processing. */
  outputPath?: string
  /** Specifies where (in the input) to place the "output" of the virtual task specified in Result. The input is further filtered as prescribed by the OutputPath field (if present) before being used as the state's output. */
  resultPath?: string
}

export interface IRetrier {
  /** A non-empty array of Strings that match error names, specified exactly as they are with the retrier field of the same name. */
  errorEquals: string[]
  /** An integer that represents the number of seconds before the first retry attempt (default 1). */
  intervalSeconds?: number
  /** A number that is the multiplier by which the retry interval increases on each attempt (default 2.0). */
  backoffRate?: number
  /** A positive integer, representing the maximum number of retry attempts (default 3). If the error recurs more times than specified, retries cease and normal error handling resumes. A value of 0 is permitted and indicates that the error or errors should never be retried. */
  maxAttempts?: number
}

export interface IErrorHandler {
  /** A non-empty array of Strings that match Error Names, specified exactly as with the Retrier field of the same name. */
  errorEquals?: string[]
  /** An array of states or state definition based on fluent API */
  next: string
  /** A path which determines what is sent as input to the state specified by the Next field. */
  resultPath?: string
}
