import {
  IAWSLambdaProxyIntegrationRequest,
  IDictionary,
  isLambdaProxyRequest,
  getBodyFromPossibleLambdaProxyRequest,
  createError
} from "common-types";

import {
  ILambdaFunctionType,
  ILambdaSequenceStep,
  Sequence,
  ILambdaSequenceNextTuple,
  ILambaSequenceFromResponse,
  ILambdaSequenceParams
} from "./@types";

function size(obj: IDictionary) {
  let size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}
export class LambdaSequence {
  /**
   * **add** (static initializer)
   *
   * Instantiates a `LambdaSequence` object and then adds a task to the sequence
   */
  public static add<T extends IDictionary = IDictionary>(
    arn: string,
    params: ILambdaSequenceParams<T> = {},
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
   *
   * Example Code:
   *
```typescript
export function handler(event, context, callback) {
  const { request, sequence, apiGateway } = LambdaSequence.from(event);
  // ... do some stuf ... 
  await sequence.next();
}
```
   */
  public static from<T extends IDictionary = IDictionary>(
    event: T | IAWSLambdaProxyIntegrationRequest,
    logger?: import("aws-log").ILoggerApi
  ) {
    const obj = new LambdaSequence();

    return obj.from(event);
  }

  public static notASequence() {
    const obj = new LambdaSequence();
    obj._steps = [];
    obj._isASequence = false;
    return obj;
  }

  private _steps: ILambdaSequenceStep[] = [];
  private _isASequence: boolean = true;

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
    params: ILambdaSequenceParams<T> = {},
    type: ILambdaFunctionType = "task"
  ) {
    this._steps.push({ arn, params: params, type, status: "assigned" });
    return this;
  }

  /**
   * **next**
   *
   * Executes the _next_ function in the sequence. It will pass parameters which are a
   * merge of those set during the original setup (aka, with the `add()` method) and
   * additional values set here as the optional `additionalParams` value.
   */
  public next<T extends IDictionary = IDictionary>(
    additionalParams: Partial<T> = {},
    logger?: import("aws-log").ILoggerApi
  ): ILambdaSequenceNextTuple<T> {
    if (this.isDone()) {
      throw createError(
        `aws-orchestration/sequence-done`,
        `Attempt to call next() on a sequence which is already completed. Always check sequence's state with isDone() before running next().`
      );
    }
    if (logger) {
      logger.info(`the next() function is ${this.nextFn.arn}`, this.toJSON());
    }

    const tuple: ILambdaSequenceNextTuple<T> = [
      this.nextFn.arn,
      {
        ...this.nextFn.params,
        ...additionalParams,
        _sequence: this.steps
      } as Sequence<T>
    ];

    if (this.activeFn) {
      const results = { ...tuple[1] };
      delete results._sequence;
      this.activeFn.results = results;
      this.activeFn.status = "completed";
    }
    this.nextFn.status = "active";
    this.dynamicProperties.map(p => {
      tuple[1][p.key] = tuple[1][p.from];
    });

    return tuple;
  }

  /**
   * **from**
   *
   * comments are in static method
   */
  public from<T extends IDictionary = IDictionary>(
    request: T | IAWSLambdaProxyIntegrationRequest,
    logger?: import("aws-log").ILoggerApi
  ): ILambaSequenceFromResponse<T> {
    let apiGateway: IAWSLambdaProxyIntegrationRequest | undefined;
    // separate possible LambdaProxy request from main request
    if (isLambdaProxyRequest(request)) {
      apiGateway = request;
      request = getBodyFromPossibleLambdaProxyRequest<T>(request);
    }
    // there is no sequence property on the request
    if (!request._sequence) {
      if (logger) {
        logger.info("This execution is not part of a sequence");
      }
      return { request, apiGateway, sequence: LambdaSequence.notASequence() };
    }
    // looks like a valid sequence
    this._steps = request._sequence;
    // active function's output is sent into next's params
    const transformedRequest = { ...request, ...this.activeFn.params };
    // remove the sequence data from the request as this payload will be
    // available in the return LambdaSequence object
    delete transformedRequest._sequence;
    if (logger) {
      logger.info("This execution is part of a sequence", {
        sequence: String(this)
      });
    }
    return { request: transformedRequest, apiGateway, sequence: this };
  }

  public isSequence() {
    return this._isASequence;
  }

  public isDone() {
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

  public get dynamicProperties(): Array<{ key: string; from: string }> {
    return Object.keys(this.activeFn.params).reduce((prev, key) => {
      const currentValue = this.activeFn.params[key];
      const valueIsDynamic = String(currentValue).slice(0, 1) === ":";

      return valueIsDynamic
        ? prev.concat({ key, from: currentValue.slice(1) })
        : prev;
    }, []);
  }

  public toString() {
    return JSON.stringify(this.toObject(), null, 2);
  }
  public toObject() {
    const obj: IDictionary = {
      isASequence: this._isASequence
    };
    if (this._isASequence) {
      obj.totalSteps = this.steps.length;
      obj.completedSteps = this.completed.length;
      if (this.activeFn) {
        obj.activeFn = { arn: this.activeFn.arn, params: this.activeFn.params };
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
}
