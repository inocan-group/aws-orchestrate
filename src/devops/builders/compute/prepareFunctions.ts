import { IServerlessFunction } from "common-types";
import { IServerlessFunctionConfig } from "~/devops";

/**
 * The config properties on a serverless function which are more generic and
 * might have values which would be used as defaults.
 */
export type IGenericFunctionConfig = Omit<
  IServerlessFunctionConfig,
  "name" | "handler" | "package"
>;

export type IFunctionPrepConfig = {
  handlerLocation: string | string[];
  defaults: Partial<IGenericFunctionConfig>;
  additionalFunctions: IServerlessFunction[];
};

export type IPrepareFunctions<E extends string = never> = Omit<
  {
    /**
     * The function prep's configuration based on configuration so far
     */
    config: Readonly<IFunctionPrepConfig>;
    /**
     * **handlerLocation**
     *
     * Handler functions written in Typescript will automatically be detected
     * when using **aws-orchestrate**'s `wrapper` functionality.
     *
     * By default the build process will use AST on all typescript files in `/src` but
     * you can improve the build performance by being more specific about where the
     * handler files will be found.
     */
    handlerLocation: (loc: string | string[]) => IPrepareFunctions<E | "handlerLocation">;
    /**
     * **defaults**
     *
     * You may specify the _default configuration_ for discovered functions in your
     * source. Any configuration at the function level will override these defaults.
     */
    defaults: (config: Partial<IGenericFunctionConfig>) => IPrepareFunctions<E | "defaults">;
    /**
     * **additionalFunctions**
     *
     * Allows adding any additional functions which might be written in a non-typescript language
     * or for any other reason is not being picked up by the automatic function resolver.
     */
    additionalFunctions: (
      fns: IServerlessFunction[]
    ) => IPrepareFunctions<E | "additionalFunctions">;
  },
  E
>;

/**
 * A higher order function where the first caller is responsible for providing
 * context on IAM and Resources, and the second is then able to configure the
 */
export function prepareFunctions() {
  const api = <E extends string>(
    state: IFunctionPrepConfig = {
      handlerLocation: "src/handlers",
      defaults: {},
      additionalFunctions: [],
    } as IFunctionPrepConfig
  ): IPrepareFunctions<E> =>
    ({
      config: state,
      handlerLocation: (loc: string | string[]) => {
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
    } as IPrepareFunctions<E>);

  return api<never>();
}
