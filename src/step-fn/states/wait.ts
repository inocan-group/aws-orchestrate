import { Finalized, IConfigurableStepFn, IStore, IWait, IWaitOptions } from "~/types";

export function waitWrapper(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (options?: IWaitOptions) => {
    commit(Wait(options));
    return api();
  };
}

export function Wait(options?: IWaitOptions): IWait | Finalized<IWait> {
  return {
    type: "Wait",
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined ? { name: options?.name, isFinalized: true } : { isFinalized: false }),
  };
}
