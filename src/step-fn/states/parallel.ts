import {
  Finalized,
  FluentApi,
  IConfigurableStepFn,
  IParallel,
  IParallelBranchOptions,
  IParallelOptions,
  IStore,
  ParallelFluentApi,
} from "~/types";
import { parseAndFinalizeStepFn } from "../entities/state";

export const isOptions = (
  obj: IParallelBranchOptions | IParallelOptions | FluentApi<ParallelFluentApi, ParallelFluentApi>
): obj is IParallelOptions => obj !== undefined && "comment" in obj;

export function isShorthand(
  obj: FluentApi<ParallelFluentApi, ParallelFluentApi> | IParallelBranchOptions
): obj is IParallelBranchOptions {
  return "getState" in obj || "finalize" in obj || Array.isArray(obj);
}

function parallelFluentApi(fn: FluentApi<ParallelFluentApi, ParallelFluentApi>) {
  const api = (state: IParallelBranchOptions[]) => {
    return {
      state,
      addBranch: (selector: IParallelBranchOptions) => {
        return api([...state, selector]);
      },
    };
  };

  return fn(api([]));
}

export function parallelConfiguration(
  ...params:
    | [FluentApi<ParallelFluentApi, ParallelFluentApi>]
    | [FluentApi<ParallelFluentApi, ParallelFluentApi>, IParallelOptions]
    | IParallelBranchOptions[]
    | [...IParallelBranchOptions[], IParallelOptions]
): IParallel | Finalized<IParallel> {
  const branches = [];
  let options: IParallelOptions = {};

  for (const param of params) {
    if (isOptions(param)) {
      options = param;
    } else if (isShorthand(param)) {
      const finalizedStepFn = parseAndFinalizeStepFn(param);
      branches.push({
        deployable: finalizedStepFn,
      });
    } else {
      const fluentResult = parallelFluentApi(param);
      "state" in fluentResult &&
        // eslint-disable-next-line unicorn/no-array-for-each
        (fluentResult["state"] as IParallelBranchOptions[]).forEach((deployable) => {
          branches.push({
            deployable,
          });
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
    ...params:
      | [FluentApi<ParallelFluentApi, ParallelFluentApi>]
      | [FluentApi<ParallelFluentApi, ParallelFluentApi>, IParallelOptions]
      | IParallelBranchOptions[]
      | [...IParallelBranchOptions[], IParallelOptions]
  ) => {
    commit(parallelConfiguration(...params));

    return api();
  };
}
