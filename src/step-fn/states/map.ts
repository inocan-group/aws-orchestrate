import { ServerlessError } from "~/errors";
import {
  IConfigurableStepFn,
  IFluentApi,
  IMap,
  IMapConfiguration,
  IMapOptions,
  IMapUseConfigurationWrapper,
  IStepFnShorthand,
  IStore,
} from "~/types";
import { parseAndFinalizeStepFn } from "../..";

export function map(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (itemsPath: string, options?: IMapOptions) => {
    return {
      use: (params: IFluentApi | IStepFnShorthand) => {
        commit(mapUseConfiguration(itemsPath, options)(params));
        return api();
      },
    };
  };
}

const mapUseConfiguration: IMapUseConfigurationWrapper<IMap> = (itemsPath, options?: IMapOptions) => (
  params: IFluentApi | IStepFnShorthand
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
