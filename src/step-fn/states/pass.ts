import { Finalized, IConfigurableStepFn, IPass, IPassOptions, IStore } from "~/types";

export function passWrapper(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (options?: IPassOptions) => {
    commit(Pass(options));
    return api();
  };
}

export function Pass(options?: IPassOptions): IPass | Finalized<IPass> {
  return {
    type: "Pass",
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined ? { name: options?.name, isFinalized: true } : { isFinalized: false }),
  };
}
