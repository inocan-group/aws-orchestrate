import { ServerlessError } from "~/errors";
import {
  IConfigurableStepFn,
  IMap,
  IMapConfiguration,
  IMapOptions,
  IMapUseConfigurationWrapper,
  IStepFnFluentApi,
  IStepFnShorthand,
  IStore,
} from "~/types";
import { parseAndFinalizeStepFn } from "../entities/state";

export function map(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (itemsPath: string, options?: IMapOptions) => {
    return {
      use: (params: IStepFnFluentApi | IStepFnShorthand) => {
        commit(mapUseConfiguration(itemsPath, options)(params));
        return api();
      },
    };
  };
}

const mapUseConfiguration: IMapUseConfigurationWrapper<IMap> = (itemsPath, options?: IMapOptions) => (
  params: IStepFnFluentApi | IStepFnShorthand
) => {
  if (!itemsPath.startsWith("$.")) {
    throw new ServerlessError(400, `itemsPath ${itemsPath} is not allowed. It must start with "$."`, "bad-format");
  }
  const finalizedStepFn = parseAndFinalizeStepFn(params);
  return {
    type: "Map",
    deployable: finalizedStepFn,
    itemsPath,
    ...options,
    isTerminalState: false,
    ...(options?.name !== undefined ? { name: options.name, isFinalized: true } : { isFinalized: false }),
  };
};

export const mapConfiguration: IMapConfiguration = (itemsPath, mapOptions) => {
  return {
    use: (params) => mapUseConfiguration(itemsPath, mapOptions)(params),
  };
};
