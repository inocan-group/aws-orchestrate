import { Finalized, IConfigurableStepFn, IStore, ISucceed } from "~/types";

export function succeedWrapper(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (name?: string | undefined) => {
    commit(Succeed(name));
    return api().finalize();
  };
}

export function Succeed(name?: string | undefined): ISucceed | Finalized<ISucceed> {
  return {
    type: "Succeed",
    isTerminalState: true,
    ...(name !== undefined ? { name, isFinalized: true } : { isFinalized: false }),
  };
}
