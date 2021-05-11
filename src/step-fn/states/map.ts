import { ServerlessError } from "~/errors";
import {
  IConfigurableStepFn,
  IMap,
  IMapBuilder,
  IMapOptions,
  IMapState,
  IStepFn,
  IStore,
  PathVariable,
} from "~/types";
import { ICatchConfig, ICatchFluentApi } from "..";
import { parseAndFinalizeStepFn } from "../entities/state";

export function Map<T extends string>(
  builder: (builder: IMapBuilder<"state">) => (IMapBuilder<T>)
): IMap {
  const api = <E extends string = "state">(state: Partial<IMapState>) => {
    return {
      state,
      itemsPath(val: PathVariable) {
        return api<E | "itemsPath">({ ...state, itemsPath: val });
      },
      stepFunction(val: IStepFn) {
        return api<E | "stepFunction">({ ...state, stepFunction: val });
      },
      catch(val: ICatchConfig | ICatchFluentApi) {
        return api<E | "catch">({ ...state, catch: val });
      },
      name(val: string) {
        return api<E | "name">({ ...state, name: val });
      },
      options(val: Omit<IMapOptions, "iterator" | "itemsPath" | "name" | "catch">) {
        return api<E | "options">({
          ...state,
          ...val,
        });
      },
    };
  };

  const builderOutput = builder(api<"state">({}));
  if (!("state" in builderOutput)) {
    throw new ServerlessError(400, "State machine configuration is not defined", "bad-request");
  }

  const params = builderOutput["state"] as IMapState;

  if (!params.stepFunction) {
    throw new ServerlessError(400, "No step function defined", "bad-request");
  }

  const { stepFunction, itemsPath, name, ...rest } = params;

  if (itemsPath && !itemsPath.startsWith("$.")) {
    throw new ServerlessError(
      400,
      `itemsPath ${itemsPath} is not allowed. It must start with "$."`,
      "bad-format"
    );
  }
  const finalizedStepFn = parseAndFinalizeStepFn(stepFunction);
  return {
    type: "Map",
    deployable: finalizedStepFn,
    itemsPath,
    ...rest,
    isTerminalState: false,
    ...(name !== undefined ? { name, isFinalized: true } : { isFinalized: false }),
  };
}

export function mapWrapper(api: () => IConfigurableStepFn, commit: IStore["commit"]) {
  return (builder: (builder: IMapBuilder<"state">) => IMapBuilder<any>) => {
    commit(Map(builder));
    return api();
  };
}
