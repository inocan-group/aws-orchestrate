import { IFunctionPrepConfig, IPrepareFunctions } from "~/devops/types/stack/functions";

/**
 * Allows a caller to gain access to an API for changing Lambda function
 * configuration. The resultant configuraton will not _yet_ call the AST to
 * find the functions but will provide all the information needed to combine
 * with this when the user is finished stating the configuration.
 */
export function prepareFunctions() {
  const api = <E extends string>(
    state: IFunctionPrepConfig = {
      handlerLocation: "src/handlers",
      defaults: {},
      additionalFunctions: [],
      buildDirectory: "dist/",
    } as IFunctionPrepConfig
  ): IPrepareFunctions<E> =>
    ({
      config: state,
      handlerLocation: (loc: string) => {
        state.handlerLocation = loc;
        return api<E | "handlerLocation">(state);
      },
      defaults: (c) => {
        state.defaults = c;
        return api<E | "defaults">(state);
      },
      additionalFunctions: (fns) => {
        state.additionalFunctions = fns;
        return api<E | "additionalFunctions">(state);
      },
      buildDirectory: (dir) => {
        state.buildDirectory = dir;
        return api<E | "buildDirectory">(state);
      },
    } as IPrepareFunctions<E>);

  return api<never>();
}
