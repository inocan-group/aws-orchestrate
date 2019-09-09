import { IAWSLambdaProxyIntegrationRequest, IDictionary } from "common-types";
import { ILambdaFunctionType, ILambdaSequenceStep, ILambdaSequenceNextTuple, ILambaSequenceFromResponse, IOrchestratedMessageBody } from "./@types";
export declare type IPropertyOrDynamicReference<T> = {
    [P in keyof T]: T[P] | string;
};
export declare class LambdaSequence {
    /**
     * **add** (static initializer)
     *
     * Instantiates a `LambdaSequence` object and then adds a task to the sequence
     */
    static add<T extends IDictionary = IDictionary>(arn: string, params?: Partial<IPropertyOrDynamicReference<T>>, type?: ILambdaFunctionType): LambdaSequence;
    /**
     * **from**
     *
     * Allows you to take the event payload which your handler gets from Lambda
     * and return a hash/dictionary with the following properties:
     *
     * - the `request` (core event without "sequence" meta or LamdaProxy info
     * from API Gateway)
     * - the `sequence` as an instantiated class of **LambdaSequence**
     * - the `apiGateway` will have the information from the Lambda Proxy request
     * (only if request came from API Gateway)
     * - the `headers` will be filled with a dictionary of name/value pairs regardless
     * of whether the request came from API Gateway (equivalent to `apiGateway.headers`)
     * or from another function which was invoked as part of s `LambdaSequence`
     *
     * Example Code:
     *
  ```typescript
  export function handler(event, context, callback) {
    const { request, sequence, apiGateway } = LambdaSequence.from(event);
    // ... do some stuff ...
    await sequence.next()
  }
  ```
     * **Note:** if you are using the `wrapper` function then the primary use of this
     * function will have already been done for you by the _wrapper_.
     */
    static from<T extends IDictionary = IDictionary>(event: T | IAWSLambdaProxyIntegrationRequest, logger?: import("aws-log").ILoggerApi): ILambaSequenceFromResponse<T>;
    static notASequence(): LambdaSequence;
    private _steps;
    private _isASequence;
    /**
     * **add**
     *
     * adds another task to the sequence
     *
     * @param arn the function name; it can be a full AWS arn or a shortened version with just the function name (assuming appropriate ENV variables are set)
     * @param params any parameters for the downstream function in the sequence which are known at build time
     * @param type not critical but provides useful context about the function of the function being added to the sequence
     *
     * **Note:** to use the shortened **arn** you will need to ensure the function has
     * the following defined as ENV variables:
     *
     * - `AWS_STAGE`
     * - `AWS_ACCOUNT_ID`
     * - `AWS_REGION`
     * - `AWS_MOVE_SERVICES`
     *
     * These should relatively static and therefore should be placed in your `env.yml` file if
     * you're using the Serverless framework.
     */
    add<T extends IDictionary = IDictionary>(arn: string, params?: Partial<IPropertyOrDynamicReference<T>>, type?: ILambdaFunctionType): this;
    /**
     * **next**
     *
     * Executes the _next_ function in the sequence. It will pass parameters which are a
     * merge of those set during the original setup (aka, with the `add()` method) and
     * additional values set here as the optional `additionalParams` value.
     *
     * If this were not clear from the prior paragraph, it is expected that if a given function
     * produces meaningful output that it would both _return_ the output (for non-orchestrated
     * executions) and also add it to the `additionalParams` value in `next()` (for orchestrated
     * executions)
     *
     * Finally, while this function doesn't _require_ you state the generic type, if you do then
     * you will get more precise typing for the expected input of the next function
     */
    next<T extends IDictionary = IDictionary>(additionalParams?: Partial<T>, logger?: import("aws-log").ILoggerApi): ILambdaSequenceNextTuple<T>;
    /**
     * **from**
     *
     * unboxes `request`, `sequence`, `apiGateway`, and `headers` data structures
     */
    from<T extends IDictionary = IDictionary>(event: T | IAWSLambdaProxyIntegrationRequest | IOrchestratedMessageBody<T>, logger?: import("aws-log").ILoggerApi): ILambaSequenceFromResponse<T>;
    /**
     * boolean flag which indicates whether the current execution of the function
     * is part of a _sequence_.
     */
    readonly isSequence: boolean;
    readonly isDone: boolean;
    /**
     * the tasks in the sequence that still remain in the
     * "assigned" category. This excludes those which are
     * completed _and_ any which are _active_.
     */
    readonly remaining: ILambdaSequenceStep<IDictionary<any>>[];
    /** the tasks which have been completed */
    readonly completed: ILambdaSequenceStep<IDictionary<any>>[];
    /** the total number of _steps_ in the sequence */
    readonly length: number;
    /**
     * **steps**
     *
     * returns the list of steps which have been accumulated
     * so far
     */
    readonly steps: ILambdaSequenceStep<IDictionary<any>>[];
    readonly nextFn: ILambdaSequenceStep<IDictionary<any>>;
    readonly activeFn: ILambdaSequenceStep<IDictionary<any>>;
    /**
     * Provides a dictionary of of **results** from the functions prior to it.
     * The dictionary is two levels deep and will look like this:
     *
  ```javascript
  {
    [fnName]: {
      prop1: value,
      prop2: value
    },
    [fn2Name]: {
      prop1: value
    }
  }
  ```
     */
    readonly allHistoricResults: IDictionary<any>;
    /**
     * Ingests a set of steps into the current sequence; resolving
     * dynamic properties into real values at the same time.
     *
     * **Note:** if this sequence _already_ has steps it will throw
     * an error.
     *
     * **Note:** you can pass in either a serialized string or the actual
     * array of steps.
     */
    ingestSteps(request: any, steps: string | ILambdaSequenceStep[]): void;
    /**
     * **dynamicProperties**
     *
     * if the _value_ of a parameter passed to a function leads with the `:`
     * character this is an indicator that it is a "dynamic property" and
     * it's true value should be looked up from the sequence results.
     */
    readonly dynamicProperties: Array<{
        key: string;
        from: string;
    }>;
    toString(): string;
    toObject(): IDictionary<any>;
    toJSON(): IDictionary<any>;
    private resolveDynamicProperties;
}
