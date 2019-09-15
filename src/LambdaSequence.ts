import {
  IAWSLambdaProxyIntegrationRequest,
  IDictionary,
  isLambdaProxyRequest,
  getBodyFromPossibleLambdaProxyRequest
} from "common-types";

import {
  ILambdaFunctionType,
  ILambdaSequenceStep,
  Sequence,
  ILambdaSequenceNextTuple,
  ILambaSequenceFromResponse,
  IOrchestratedMessageBody,
  WithBodySequence,
  IWrapperRequestHeaders
} from "./@types";
import { isOrchestratedMessageBody } from "./sequences";

function size(obj: IDictionary) {
  let size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}

export type IPropertyOrDynamicReference<T> = { [P in keyof T]: T[P] | string };
export class LambdaSequence {
  /**
   * **add** (static initializer)
   *
   * Instantiates a `LambdaSequence` object and then adds a task to the sequence
   */
  public static add<T extends IDictionary = IDictionary>(
    arn: string,
    params: Partial<IPropertyOrDynamicReference<T>> = {},
    type: ILambdaFunctionType = "task"
  ) {
    const obj = new LambdaSequence();
    obj.add(arn, params, type);
    return obj;
  }

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
  public static from<T extends IDictionary = IDictionary>(
    event: T | IAWSLambdaProxyIntegrationRequest,
    logger?: import("aws-log").ILoggerApi
  ) {
    const obj = new LambdaSequence();

    return obj.from(event, logger);
  }

  /**
   * instantiate a sequence with no steps;
   * this is considered a _non_-sequence (aka.,
   * it is `LambdaSequence` class but until it
   * has steps it's role is simply to state that
   * it is NOT a sequence)
   */
  public static notASequence() {
    const obj = new LambdaSequence();
    obj._steps = [];
    // obj._isASequence = false;
    return obj;
  }

  private _steps: ILambdaSequenceStep[] = [];
  // private _isASequence: boolean = true;

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
  public add<T extends IDictionary = IDictionary>(
    arn: string,
    params: Partial<IPropertyOrDynamicReference<T>> = {},
    type: ILambdaFunctionType = "task"
  ) {
    this._steps.push({ arn, params, type, status: "assigned" });
    return this;
  }

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
  public next<T extends IDictionary = IDictionary>(
    additionalParams: Partial<T> = {},
    logger?: import("aws-log").ILoggerApi
  ): ILambdaSequenceNextTuple<T> {
    if (logger) {
      logger.getContext();
    }
    if (this.isDone) {
      if (logger) {
        logger.info(
          `The next() function [ ${this.activeFn.arn} ] was called but we are now done with the sequence so exiting.`
        );
      }
      return;
    }

    if (logger) {
      logger.info(`the next() function is ${this.nextFn.arn}`, this.toJSON());
    }

    /**
     * if there is an active function, set it to completed
     * and assign _results_
     */
    if (this.activeFn) {
      const results = additionalParams;
      delete results._sequence;
      this.activeFn.results = results;
      this.activeFn.status = "completed";
    }

    // resolve dynamic props in next function
    this._steps = this._steps.map(i =>
      i.arn === this.nextFn.arn
        ? {
            ...i,
            params: this.resolveDynamicProperties(
              this.nextFn.params,
              additionalParams
            )
          }
        : i
    );

    const nextFunctionTuple: ILambdaSequenceNextTuple<T> = [
      // the arn
      this.nextFn.arn,
      // the params passed forward
      {
        ...this.nextFn.params,
        _sequence: this.steps
      } as Sequence<T>
    ];

    // set the next function to active
    this.nextFn.status = "active";

    return nextFunctionTuple;
  }

  /**
   * **from**
   *
   * unboxes `request`, `sequence`, `apiGateway`, and `headers` data structures
   */
  public from<T extends IDictionary = IDictionary>(
    event: T | IAWSLambdaProxyIntegrationRequest | IOrchestratedMessageBody<T>,
    logger?: import("aws-log").ILoggerApi
  ): ILambaSequenceFromResponse<T> {
    let apiGateway: IAWSLambdaProxyIntegrationRequest | undefined;
    let headers: IWrapperRequestHeaders = {};
    let sequence: LambdaSequence;
    let request: T;

    if (isLambdaProxyRequest(event)) {
      apiGateway = event;
      headers = event.headers;
      delete apiGateway.headers;
      request = getBodyFromPossibleLambdaProxyRequest<T>(event);
      sequence = LambdaSequence.notASequence();
      delete apiGateway.body;
    } else if (isOrchestratedMessageBody(event)) {
      headers = (event as IOrchestratedMessageBody<T>).headers;
      request = event.body;
      if (event.sequenceSteps) {
        this.ingestSteps(
          request,
          (event as IOrchestratedMessageBody<T>).sequenceSteps
        );
        sequence = this;
      } else {
        sequence = LambdaSequence.notASequence();
      }
    } else if ((event as WithBodySequence<T>)._sequence) {
      const e = new Error();
      console.log({
        message: `Deprecated: a Lambda event received the property "_sequence" which is an OLD way of passing sequence data to other functions. This technique will be removed in the future.`,
        stack: e.stack
      });
      request = { ...{}, ...event } as T;
      delete request._sequence;
      this.ingestSteps(request, (event as WithBodySequence<T>)._sequence);
      sequence = this;
    } else {
      sequence = LambdaSequence.notASequence();
    }

    // The active function's output is sent into the params
    const activeFn =
      this.activeFn && this.activeFn.params ? this.activeFn.params : {};
    request = { ...activeFn, ...request } as T;

    return {
      request,
      apiGateway,
      sequence,
      headers: headers as IWrapperRequestHeaders
    };
  }

  /**
   * boolean flag which indicates whether the current execution of the function
   * is part of a _sequence_.
   */
  public get isSequence() {
    // return this._isASequence;
    return this._steps.length > 0;
  }

  public get isDone() {
    return this.remaining.length === 0;
  }

  /**
   * the tasks in the sequence that still remain in the
   * "assigned" category. This excludes those which are
   * completed _and_ any which are _active_.
   */
  public get remaining() {
    return this._steps.filter(s => s.status === "assigned");
  }

  /** the tasks which have been completed */
  public get completed() {
    return this._steps.filter(s => s.status === "completed");
  }

  /** the total number of _steps_ in the sequence */
  public get length() {
    return this._steps.length;
  }

  /**
   * **steps**
   *
   * returns the list of steps which have been accumulated
   * so far
   */
  public get steps() {
    return this._steps;
  }

  public get nextFn() {
    return this.remaining.length > 0 ? this.remaining[0] : undefined;
  }

  public get activeFn() {
    const active = this._steps.filter(s => s.status === "active");
    return active.length > 0 ? active[0] : undefined;
  }

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
  public get allHistoricResults() {
    const completed = this._steps.filter(s => s.status === "completed");
    let result: IDictionary = {};
    completed.forEach(s => {
      const fn = s.arn;
      result[fn] = s.results;
    });

    return result;
  }

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
  public ingestSteps(request: any, steps: string | ILambdaSequenceStep[]) {
    if (typeof steps === "string") {
      steps = JSON.parse(steps) as ILambdaSequenceStep[];
    }

    if (this._steps.length > 0) {
      throw new Error(
        `Attempt to ingest steps into a LambdaSequence that already has steps!`
      );
    }

    this._steps = steps;
    // this._isASequence = true;
    const activeFnParams =
      this.activeFn && this.activeFn.params ? this.activeFn.params : {};
    const transformedRequest =
      typeof request === "object"
        ? { ...activeFnParams, ...request }
        : { ...activeFnParams, request };

    /**
     * Inject the prior function's request params into
     * active functions params (set in the conductor)
     */
    this._steps = this._steps.map(s => {
      return this.activeFn && s.arn === this.activeFn.arn
        ? { ...s, params: transformedRequest }
        : s;
    });
  }

  /**
   * **dynamicProperties**
   *
   * if the _value_ of a parameter passed to a function leads with the `:`
   * character this is an indicator that it is a "dynamic property" and
   * it's true value should be looked up from the sequence results.
   */
  public get dynamicProperties(): Array<{ key: string; from: string }> {
    return Object.keys(this.activeFn ? this.activeFn.params : {}).reduce(
      (prev, key) => {
        const currentValue = this.activeFn.params[key];
        const valueIsDynamic = String(currentValue).slice(0, 1) === ":";

        return valueIsDynamic
          ? prev.concat({ key, from: currentValue.slice(1) })
          : prev;
      },
      []
    );
  }

  public toString() {
    return JSON.stringify(this.toObject(), null, 2);
  }
  public toObject() {
    const obj: IDictionary = {
      isASequence: this.isSequence
    };
    if (this.isSequence) {
      obj.totalSteps = this.steps.length;
      obj.completedSteps = this.completed.length;
      if (this.activeFn) {
        obj.activeFn = this.activeFn
          ? { arn: this.activeFn.arn, params: this.activeFn.params }
          : {};
      }
      if (this.completed) {
        obj.completed = this.completed.map(i => i.arn);
      }
      if (this.remaining) {
        obj.remaining = this.remaining.map(i => i.arn);
      }
      obj.results = this.completed.reduce(
        (acc, curr) => {
          const objSize = size(curr.results);
          acc[curr.arn] =
            objSize < 4096
              ? curr.results
              : {
                  message: `truncated due to size [ ${objSize} ]`,
                  properties: Object.keys(curr.results)
                };
          return acc;
        },
        {} as IDictionary
      );
    }
    return obj;
  }
  public toJSON() {
    return this.toObject();
  }

  private resolveDynamicProperties(
    conductorParams: IDictionary,
    priorFnResults: IDictionary
  ) {
    /**
     * Properties on `priorFnResults` which have been remapped by dyamic properties.
     * Note that this only takes place when the conductor's dynamic property is for
     * "last" function's result. If it is from prior results then it these will be considered
     * additive properties and _remapped_ properties
     */
    let remappedProps: string[] = [];

    Object.keys(conductorParams).forEach(key => {
      const value = conductorParams[key];

      if (typeof value === "string" && value.slice(0, 1) === ":") {
        const lookup = value.slice(1);
        const isFromLastFn = !lookup.includes(".");
        if (isFromLastFn) {
          remappedProps.push(lookup);
          conductorParams[key] = priorFnResults[lookup];
        } else {
          const [fnLookup, fnProp] = lookup.split(".");
          const relevantStep = this.steps.find(i => i.arn === fnLookup);

          conductorParams[key] = relevantStep.results[fnProp];
        }
      }
    });

    return {
      ...Object.keys(priorFnResults).reduce(
        (agg, curr) =>
          !remappedProps.includes(curr)
            ? { ...agg, [curr]: priorFnResults[curr] }
            : agg,
        {}
      ),
      ...conductorParams
    };
  }
}
