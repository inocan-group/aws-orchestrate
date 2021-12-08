/* eslint-disable unicorn/consistent-function-scoping */
import merge from "merge-deep";
import type {
  DefaultStages,
  IServerlessStack,
  IStackApi,
  IPrepareFunctions,
  IFunctionPrepConfig,
  IStackOptions,
} from "~/devops/types/stack";
import { findHandlerFunctions } from "~/devops/utils";
import { hasConfigProperty } from "..";
import { prepareFunctions } from "./compute";

/**
 * **createStack**
 *
 * Creates a AWS Stack using the Serverless Framework.
 *
 * Example:
 * ```ts
 * const stack = createStack("my-stack", "profile")
 *    .addResource(r => r.dynamoTable('Customer'))
 *    .prepareLambda(l => l.defaults({ memorySize: 1024 }))
 * ```
 */
function createApi<N extends string, S extends readonly string[], E extends string = never>(
  stack: Readonly<IServerlessStack<N, any>>,
  options: IStackOptions,
  updates?: Partial<IServerlessStack<N, S>>
): IStackApi<N, S, E> {
  const newStack = (updates ? merge(stack, updates) : stack) as unknown as IServerlessStack<N, S>;

  return {
    stack: newStack as IServerlessStack<N, S>,
    addResource: (resources) => {
      return resources
        ? createApi<N, S, E>(stack, options, { resources })
        : createApi<N, S, E>(stack, options);
    },
    addStepFunction: () => createApi<N, S, E>(stack, options),
    prepareLambda: (cb: <T extends string>(api: IPrepareFunctions) => IPrepareFunctions<T>) => {
      const api = cb(prepareFunctions());
      if (!hasConfigProperty<IFunctionPrepConfig>(api)) {
        throw new Error("Function prep provided no config!");
      }
      const config = api.config;

      const autoFns = findHandlerFunctions(config.handlerLocation).map((f) => {
        function fnToBuildDir(src: string): string {
          const locations = Array.isArray(config.handlerLocation)
            ? config.handlerLocation
            : [config.handlerLocation];
          for (const l of locations) {
            src = src.replace(l, config.buildDirectory).replace(".ts", ".js");
          }
          return src;
        }
        return {
          handler: fnToBuildDir(f.file) + ".handler",
          comments: f.comments,
          vars: f.variables,
        };
      });
      console.log(autoFns);

      return createApi<N, S, E | "prepareLambda">(stack, options);
    },
  } as IStackApi<N, S, E>;
}

export function createStack<N extends string, S extends readonly string[] = DefaultStages>(
  /** the name of the stack you are configuring */
  name: N,
  /** the AWS profile which will be used for credentialization */
  profile: string,
  stackOptions: IStackOptions = {} as IStackOptions
) {
  const stack: Readonly<IServerlessStack<N, S>> = {
    name,
    provider: {
      name: "aws",
      stage: "dev" as keyof S,
      profile,
    },
    resources: {},
    functions: {},
    stepFunctions: {},
    iam: {},
    plugins: [],
  };

  return createApi<N, S>(stack, stackOptions);
}
