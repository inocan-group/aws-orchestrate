import { DefaultStages, IServerlessStack, IStackApi } from "../types/serverless-stack";
import merge from "merge-deep";

function createApi<N extends string, S extends readonly string[], E extends string = never>(
  stack: Readonly<IServerlessStack<N, any>>,
  updates?: Partial<IServerlessStack<N, S>>
): IStackApi<N, S, E> {
  const newStack = (updates ? merge(stack, updates) : stack) as unknown as IServerlessStack<N, S>;

  return {
    stack: newStack,
    resources: (resources) => {
      return resources ? createApi<N, S, E>(stack, { resources }) : createApi<N, S, E>(stack);
    },
    prepareLambda: () => createApi<N, S, E | "prepareLambda">(stack),
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
