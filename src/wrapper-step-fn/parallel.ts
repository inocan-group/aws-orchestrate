import {
  Finalized,
  IConfigurableStepFn,
  IParallel,
  IParallelBranchOptions,
  IParallelOptions,
  IStore,
  parseAndFinalizeStepFn,
} from "../private";

export function parallel(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (branches: IParallelBranchOptions[], options?: IParallelOptions) => {
    commit(parallelConfiguration(branches, options));
    return api();
  };
}

export function parallelConfiguration(
  params: IParallelBranchOptions[],
  options?: IParallelOptions,
): IParallel | Finalized<IParallel> {
  const branches = params.map(param => {
    const finalizedStepFn = parseAndFinalizeStepFn(param);
    return {
      deployable: finalizedStepFn,
    };
  });

  return {
    type: "Parallel",
    branches,
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined ? { name: options.name, isFinalized: true } : { isFinalized: false }),
  };
}
