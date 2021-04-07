import { AwsFunctionArn, IDictionary } from 'common-types'
import { IOptionsWithInput, IRetrier, IBaseState, ErrDefn, RetryOptions } from '.'

export interface ITaskOptions extends IOptionsWithInput {
  /** A path which determines what is sent as input to the state specified by the Next field. */
  resultPath?: string;
  parameters?: IDictionary;
  retry?: Record<string, RetryOptions>
  catch?: Record<string, ErrDefn>;
  /** If the task runs longer than the specified seconds, then this state fails with a States.Timeout Error Name. Must be a positive, non-zero integer. If not provided, the default value is 99999999. */
  timeoutSeconds?: number;
  /** If more time than the specified seconds elapses between heartbeats from the task, then this state fails with an States.Timeout Error Name. Must be a positive, non-zero integer less than the number of seconds specified in the TimeoutSeconds field. If not provided, the default value is 99999999. */
  heartbeatSeconds?: number;
}

/**
 * This is a test
 */
export type ITask = Omit<ITaskOptions, "name"> & IBaseState & {
  readonly type: "Task";
  resource: AwsFunctionArn;
  isTerminalState: false
}