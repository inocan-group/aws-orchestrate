import { parseArn } from "~/shared";
import { Finalized, IConfigurableStepFn, IStore, ITask, ITaskOptions } from "~/types";

/**
 *
 * @param resourceName string of the format arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:${self:service}-${opt:stage}-FUNCTION_NAME
 * @param options
 */
export function Task(resourceName: string, options: ITaskOptions = {}): ITask | Finalized<ITask> {
  const arn = parseArn(resourceName);
  const resource = `arn:aws:lambda:${arn.region}:${arn.account}:function:${arn.appName}-${arn.stage}-${arn.fn}`;
  return {
    type: "Task",
    resource,
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined ? { name: options?.name, isFinalized: true } : { isFinalized: false }),
  };
}

// TODO: You had a generic type defined here but it was unused. It was: <T extends ITask | Finalized<ITask>>
export function taskWrapper(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (resourceName: string, options: ITaskOptions = {}) => {
    const payload = Task(resourceName, options);
    commit(payload);

    return api();
  };
}