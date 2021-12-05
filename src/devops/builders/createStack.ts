/* eslint-disable unicorn/consistent-function-scoping */
import { DefaultStages, IServerlessStack, IStackApi } from "../types/serverless-stack";
import merge from "merge-deep";
import { IPrepareFunctions, prepareFunctions } from ".";
import { findHandlerFunctions } from "~/devops/utils";

function createApi<N extends string, S extends readonly string[], E extends string = never>(
  stack: Readonly<IServerlessStack<N, any>>,
  updates?: Partial<IServerlessStack<N, S>>
): IStackApi<N, S, E> {
  const newStack = (updates ? merge(stack, updates) : stack) as unknown as IServerlessStack<N, S>;

  return {
    stack: newStack as IServerlessStack<N, S>,
    resources: (resources) => {
      return resources ? createApi<N, S, E>(stack, { resources }) : createApi<N, S, E>(stack);
    },
    prepareLambda: (cb: (api: IPrepareFunctions) => IPrepareFunctions) => {
      const config = cb(prepareFunctions()).config;

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

      return createApi<N, S, E | "prepareLambda">(stack);
    },
    addStepFunction: () => createApi<N, S, E>(stack),
  } as IStackApi<N, S, E>;
}

export function createStack<N extends string, S extends readonly string[] = DefaultStages>(
  /** the name of the stack you are configuring */
  name: N,
  /** the AWS profile which will be used for credentialization */
  profile: string
) {
  const stack: Readonly<IServerlessStack<N, S>> = {
    name,
    provider: {
      name: "aws",
      stage: "dev" as keyof S,
      profile,
      httpApi: {},
    },
    resources: {},
    functions: {},
    stepFunctions: {},
    iam: {},
    plugins: [],
  };

  return createApi<N, S>(stack);
}
