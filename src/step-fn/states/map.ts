import { ServerlessError } from "~/errors";
import {
  IConfigurableStepFn,
  IMap,
  IMapOptions,
  IMapUseConfigurationWrapper,
  IMapUseParams,
  IStepFnFluentApi,
  IStepFnShorthand,
  IStore,
} from "~/types";
import { parseAndFinalizeStepFn } from "../entities/state";

export function mapWrapper(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (itemsPath: string, options?: IMapOptions) => {
    return {
      use: (params: IStepFnFluentApi | IStepFnShorthand) => {
        commit(mapUseConfiguration(itemsPath, options)(params));
        return api();
      },
    };
  };
}

const mapUseConfiguration: IMapUseConfigurationWrapper<IMap> = (
  itemsPath,
  options?: IMapOptions
) => (params: IStepFnFluentApi | IStepFnShorthand) => {
  if (!itemsPath.startsWith("$.")) {
    throw new ServerlessError(
      400,
      `itemsPath ${itemsPath} is not allowed. It must start with "$."`,
      "bad-format"
    );
  }
  const finalizedStepFn = parseAndFinalizeStepFn(params);
  return {
    type: "Map",
    deployable: finalizedStepFn,
    itemsPath,
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined
      ? { name: options.name, isFinalized: true }
      : { isFinalized: false }),
  };
};

export function Map(itemsPath: string, mapOptions?: IMapOptions) {
  return {
    use: (...params: IMapUseParams[]) => mapUseConfiguration(itemsPath, mapOptions)(...params),
  };
}
