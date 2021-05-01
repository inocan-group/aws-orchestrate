import { Finalized, IFinalizedStepFn, IFail, IFailOptions, IStore, IConfigurableStepFn } from "~/types";

export function failWrapper(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (cause: string, options?: IFailOptions): IFinalizedStepFn => {
    commit(Fail(cause, options));
    return api().finalize();
  };
}

export function Fail(cause: string, options?: IFailOptions): IFail | Finalized<IFail> {
  return {
    type: "Fail",
    cause,
    ...options,
    isTerminalState: true,
    ...(options?.name !== undefined ? { name: options?.name, isFinalized: true } : { isFinalized: false }),
  };
}
