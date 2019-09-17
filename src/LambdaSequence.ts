import {
  IAWSLambdaProxyIntegrationRequest,
  IDictionary,
  isLambdaProxyRequest,
  getBodyFromPossibleLambdaProxyRequest
} from "common-types";

import {
  ILambdaFunctionType,
  ILambdaSequenceStep,
  ILambdaSequenceNextTuple,
  ILambaSequenceFromResponse,
  IOrchestratedRequest,
  IWrapperRequestHeaders,
  ISerializedSequence,
  ICompressedSection,
  IOrchestratedDynamicProperty,
  IOrchestratedProperties,
  IWrapperResponseHeaders,
  IBareRequest,
  IOrchestrationRequestTypes
} from "./@types";
import { isOrchestratedRequest } from "./sequences/isOrchestratedMessageBody";
import { getRequestHeaders } from "./wrapper-fn/headers";
import { isDynamic, compress, decompress, isBareRequest } from "./sequences";
import get from "lodash.get";
import { logger as awsLogger } from "aws-log";

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
    params: Partial<IOrchestratedProperties<T>> = {},
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
    event: IOrchestrationRequestTypes<T>,
    logger?: import("aws-log").ILoggerApi
  ) {
    const obj = new LambdaSequence();

    return obj.from(event, logger);
  }

  /**
   * Takes a serialized sequence and brings it back to a `LambdaSequence` class.
   */
  public static deserialize<T>(s: ISerializedSequence): LambdaSequence {
    const obj = new LambdaSequence();
    obj.deserialize(s);

    return obj;
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
    return obj;
  }

  /**
   * The steps defined in the sequence
   */
  private _steps: ILambdaSequenceStep[] = [];
  /**
   * The responses from completed functions in a sequence
   */
  private _responses: IDictionary;

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
    params: Partial<IOrchestratedProperties<T>> = {},
    type: ILambdaFunctionType = "task"
  ) {
    this._steps.push({ arn, params, type, status: "assigned" });
    return this;
  }

  /**
   * **next**
   *
   * Returns the parameters needed to execute the _next_ function in the sequence. The
   * parameters passed to the next function will be of the format:
   *
   * ```typescript
   * { body, headers, sequence }
   * ```
   *
   * This structure allows the receiving `LambdaSequence.from()` function to peel
   * off _headers_ and _sequence_ information without any risk of namespace collisions
   * with the returned request object (aka, `body`).
   */
  public next<T extends IDictionary>(
    /** the _current_ function's response */
    currentFnResponse: Partial<T> = {},
    logger?: import("aws-log").ILoggerApi
  ): ILambdaSequenceNextTuple<T> {
    if (!logger) {
      logger = awsLogger();
      logger.getContext();
    }
    if (this.isDone) {
      logger.info(
        `The next() function called on ${
          this.activeFn && this.activeFn.arn ? this.activeFn.arn : "unknown"
        } was called but we are now done with the sequence so exiting.`
      );
      return;
    }

    /**
     * if there is an active function, set it to completed
     * and assign _results_
     */
    if (this.activeFn) {
      const results = currentFnResponse;
      delete results._sequence;
      this._responses[this.activeFn.arn] = results;
      this.activeFn.status = "completed";
    }

    let body: T | ICompressedSection = this.resolveRequestProperties<T>(
      this.nextFn
    );
    let sequence: ISerializedSequence | ICompressedSection = this.toObject();
    let headers:
      | IWrapperResponseHeaders
      | ICompressedSection = getRequestHeaders();

    logger.debug(
      `LambdaSequence.next(): the "${
        this.activeFn ? `"${this.activeFn.arn}" function` : `sequence Conductor`
      }" will be calling "${this.nextFn.arn}" in a moment`,
      {
        fn: this.nextFn.arn,
        request: {
          type: "orchestrated-message-body",
          body,
          sequence,
          headers
        }
      }
    );

    // compress if large
    body = compress(body, 4096);
    sequence = compress(sequence, 4096);
    headers = compress(headers, 4096);

    /**
     * The parameters needed to pass into `aws-log`'s
     * invoke() function
     */
    const invokeParams: ILambdaSequenceNextTuple<T> = [
      // the arn
      this.nextFn.arn,
      // the params passed forward
      {
        type: "orchestrated-message-body",
        sequence,
        body,
        headers
      }
    ];

    // set the next function to active
    this.nextFn.status = "active";

    return invokeParams;
  }

  /**
   * **from**
   *
   * unboxes `request`, `sequence`, `apiGateway`, and `headers` data structures
   */
  public from<T>(
    event: IOrchestrationRequestTypes<T>,
    logger?: import("aws-log").ILoggerApi
  ): ILambaSequenceFromResponse<T> {
    let apiGateway: IAWSLambdaProxyIntegrationRequest | undefined;
    let headers: IWrapperRequestHeaders = {};
    let sequence: LambdaSequence;
    let request: T;
    if (!logger) {
      logger = awsLogger();
      logger.getContext();
    }

    if (isLambdaProxyRequest(event)) {
      apiGateway = event;
      headers = apiGateway.headers;
      delete apiGateway.headers;
      request = getBodyFromPossibleLambdaProxyRequest<T>(event) as T;
      sequence = LambdaSequence.notASequence();
      delete apiGateway.body;
    } else if (isOrchestratedRequest(event)) {
      headers = decompress((event as IOrchestratedRequest<T>).headers);
      request = decompress(event.body);
      sequence = LambdaSequence.deserialize<T>(decompress(event.sequence));
    } else if (isBareRequest(event)) {
      headers = {};
      sequence =
        typeof event === "object" && event._sequence
          ? this.ingestSteps(event, event._sequence)
          : LambdaSequence.notASequence();
      request =
        typeof event === "object" && event._sequence
          ? (Object.keys(event).reduce((props: T, prop: keyof T & string) => {
              if (prop !== "_sequence") {
                props[prop] = event[prop];
              }
              return props;
            }, {}) as T)
          : event;

      const e = new Error();
      logger.warn(
        `Deprecated message format. Bare messages -- where the property "_sequence" is used to convey sequence passing -- has been replaced with the IOrchestratedRequest message body. This technique will be removed in the future.`,
        { stack: e.stack }
      );
    }

    // The active function's output is sent into the params
    const activeFn =
      this.activeFn && this.activeFn.params ? this.activeFn.params : {};
    request = { ...activeFn, ...request } as T;

    return {
      request: request as T,
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
    return this._steps && this._steps.length > 0;
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
    return this._steps ? this._steps.filter(s => s.status === "assigned") : [];
  }

  /** the tasks which have been completed */
  public get completed() {
    return this._steps ? this._steps.filter(s => s.status === "completed") : [];
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
    const active = this._steps
      ? this._steps.filter(s => s.status === "active")
      : [];
    return active.length > 0 ? active[0] : undefined;
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

    return this;
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

  /**
   * Takes a serialized state of a sequence and returns
   * a `LambdaSequence` which represents this state.
   */
  public deserialize(s: ISerializedSequence) {
    if (!s.isSequence) {
      return LambdaSequence.notASequence();
    }

    this._steps = s.steps;
    this._responses = s.responses;

    return this;
  }

  public toString() {
    return JSON.stringify(this.toObject(), null, 2);
  }
  public toObject(): ISerializedSequence {
    const obj: Partial<ISerializedSequence> = {
      isSequence: this.isSequence
    };
    if (obj.isSequence) {
      obj.totalSteps = this.steps.length;
      obj.completedSteps = this.completed.length;
      if (this.activeFn) {
        obj.activeFn = this.activeFn
          ? { arn: this.activeFn.arn, params: this.activeFn.params }
          : undefined;
      }
      if (this.completed) {
        obj.completed = this.completed.map(i => i.arn);
      }
      if (this.remaining) {
        obj.remaining = this.remaining.map(i => i.arn);
      }
      obj.steps = this._steps;
      obj.responses = this._responses || {};
    }
    return obj as ISerializedSequence;
  }
  public toJSON() {
    return this.toObject();
  }

  /**
   * Determine the request data to pass to the handler function:
   *
   * - Resolve _dynamic_ properties added by Conductor into static values
   * - Add _static_ properties passed in from Conductor
   *
   */
  private resolveRequestProperties<T>(fn: ILambdaSequenceStep) {
    return Object.keys(fn.params as IOrchestratedProperties<T>).reduce(
      (props: T, key: keyof T & string) => {
        let value = (fn.params as IOrchestratedProperties<T>)[key];
        if (isDynamic(value)) {
          value = get(
            this._responses,
            (value as IOrchestratedDynamicProperty).lookup,
            undefined
          );
          if (typeof value === undefined) {
            throw new Error(
              `The property "${key}" was set as a dynamic property by the Orchestrator but it was dependant on getting a value from ${
                (fn.params as IOrchestratedProperties<T>)[key]
              } which could not be found.`
            );
          }
        }
        const valueNow = (key: keyof T & string, value: any) =>
          value as T[typeof key];

        (props as T)[key] = valueNow(key, value);

        return props;
      },
      {} as T
    );
  }
}
