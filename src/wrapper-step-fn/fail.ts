import { Finalized, IFinalizedStepFn, IFail, IFailOptions, IStore, IConfigurableStepFn } from "../private";

export function fail(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (cause: string, options?: IFailOptions): IFinalizedStepFn => {
    commit(failConfiguration(cause, options));
    return api().finalize();
  };
}

export function failConfiguration(cause: string, options?: IFailOptions): IFail | Finalized<IFail> {
  return {
    type: "Fail",
    cause,
    ...options,
    isTerminalState: true,
    ...(options?.name !== undefined ? { name: options?.name, isFinalized: true } : { isFinalized: false }),
  };
}
