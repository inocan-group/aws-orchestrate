import {
  IMapConfiguration,
  IMapUseConfigurationWrapper,
  parseAndFinalizeStepFn,
} from '.'
import { IConfigurableStepFn, IFluentApi, IMap, IMapOptions, IStepFnShorthand, IStore } from './types'

export function map(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (itemsPath: string, options?: IMapOptions) => {
    return {
      use: (params: IFluentApi | IStepFnShorthand) => {
        commit('Map', mapUseConfiguration(itemsPath, options)(params))
        return api()
      },
    }
  }
}

const mapUseConfiguration: IMapUseConfigurationWrapper<IMap> = (itemsPath, options?: IMapOptions) => (
  params: IFluentApi | IStepFnShorthand,
) => {
  const finalizedStepFn = parseAndFinalizeStepFn(params)
  console.log(finalizedStepFn.getState())
  return {
    type: 'Map',
    deployable: finalizedStepFn,
    itemsPath,
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined ? { name: options.name, isFinalized: true } : { isFinalized: false})
  }
}

export const mapConfiguration: IMapConfiguration = (itemsPath, mapOptions) => {
  return {
    use: params => mapUseConfiguration(itemsPath, mapOptions)(params),
  }
}
