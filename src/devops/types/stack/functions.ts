import type { IServerlessFunction, IServerlessFunctionConfig } from "~/devops/types";

/**
 * The config properties on a serverless function which are more generic and
 * might have values which would be used as defaults.
 */
export type IGenericFunctionConfig = Omit<
  IServerlessFunctionConfig,
  "name" | "handler" | "package"
>;

export type IFunctionPrepConfig = {
  /** the directory to start search for _handler_ functions */
  handlerLocation: string;
  /** the _default_ configuration for Lambda functions */
  defaults: Partial<IGenericFunctionConfig>;
  /**
   * additional functions beyond the auto-discovered functions which
   * should be included in the stack.
   */
  additionalFunctions: IServerlessFunction[];
  /** the location where the handler functions will be transpiled to */
  buildDirectory: string;
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

    /**
     * By default the assumed directory for your transpiled TS is `dist/`
     * but you can change this.
     */
    buildDirectory: (dir: string) => IPrepareFunctions<E | "buildDirectory">;
  },
  E
>;

export type IHandlerFunction = {
  source: string;
  target: string;
  config: IFunctionPrepConfig;
};
