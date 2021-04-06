import { Finalized, IConfigurableStepFn, IStore, IWait, IWaitOptions } from "../private";

export function wait(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (options?: IWaitOptions) => {
    commit(waitConfiguration(options));
    return api();
  };
}

export function waitConfiguration(options?: IWaitOptions): IWait | Finalized<IWait> {
  return {
    type: "Wait",
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined ? { name: options?.name, isFinalized: true } : { isFinalized: false }),
  };
}
