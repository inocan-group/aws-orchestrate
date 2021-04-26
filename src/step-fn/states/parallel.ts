import {
  Finalized,
  IConfigurableStepFn,
  IParallel,
  IParallelBranchOptions,
  IParallelOptions,
  IStore,
} from "~/types";
import { parseAndFinalizeStepFn } from "../entities/state";

export const isOptions = (
  obj: IParallelBranchOptions | IParallelOptions
): obj is IParallelOptions => obj !== undefined && "comment" in obj;

export function parallelConfiguration(
  ...params: IParallelBranchOptions[] | [...IParallelBranchOptions[], IParallelOptions]
): IParallel | Finalized<IParallel> {
  const branches = [];
  let options: IParallelOptions = {};
  for (const param of params) {
    if (isOptions(param)) {
      console.log(param);
      options = param;
    } else {
      console.log(param);
      const finalizedStepFn = parseAndFinalizeStepFn(param);
      branches.push({
        deployable: finalizedStepFn,
      });
    }
  }

  return {
    type: "Parallel",
    branches,
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined
      ? { name: options.name, isFinalized: true }
      : { isFinalized: false }),
  };
}

export function parallel(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (
    ...params: IParallelBranchOptions[] | [...IParallelBranchOptions[], IParallelOptions]
  ) => {
    commit(parallelConfiguration(...params));

    return api();
  };
}
