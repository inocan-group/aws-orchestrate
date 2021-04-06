import { Finalized, IConfigurableStepFn, IPass, IPassOptions, IStore } from '../private'

export function pass(api: () => IConfigurableStepFn, commit: IStore['commit']) {
  return (options?: IPassOptions) => {
    commit(passConfiguration(options))
    return api()
  }
}

export function passConfiguration(options?: IPassOptions): IPass | Finalized<IPass> {
  return {
    type: 'Pass',
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined ? { name: options?.name, isFinalized: true } : { isFinalized: false }),
  }
}
