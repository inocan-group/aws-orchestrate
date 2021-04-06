import { Finalized, IConfigurableStepFn, IStore, ISucceed } from '../private'

export function succeed<T extends ISucceed | Finalized<ISucceed>>(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (name?: string | undefined) => {
    commit(succeedConfiguration(name))
    return api().finalize()
  }
}

export function succeedConfiguration(name?: string | undefined): ISucceed | Finalized<ISucceed> {
  return { type: 'Succeed', isTerminalState: true, ...(name !== undefined ? { name, isFinalized: true } : { isFinalized: false}) }
}
