import { isLambdaProxyRequest, getBodyFromPossibleLambdaProxyRequest, } from "common-types";
import get from "lodash.get";
import { logger, invoke as invokeLambda } from "aws-log";
import { isDynamic, decompress, isBareRequest, buildOrchestratedRequest, isOrchestratedRequest, } from "./private";
export class LambdaSequence {
    constructor() {
        /**
         * The steps defined in the sequence
         */
        this._steps = [];
        /**
         * The responses from completed functions in a sequence
         */
        this._responses = {};
    }
    /**
     * **add** (static initializer)
     *
     * Instantiates a `LambdaSequence` object and then adds a task to the sequence
     */
    static add(arn, params = {}, type = "task") {
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
    static from(event, logger) {
        const obj = new LambdaSequence();
        return obj.from(event, logger);
    }
    /**
     * Takes a serialized sequence and brings it back to a `LambdaSequence` class.
     */
    static deserialize(s) {
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
    static notASequence() {
        const obj = new LambdaSequence();
        obj._steps = [];
        return obj;
    }
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
     *
     * These should relatively static and therefore should be placed in your `env.yml` file if
     * you're using the Serverless framework.
     */
    add(arn, params = {}, type = "task") {
        this._steps.push({ arn, params, type, status: "assigned" });
        return this;
    }
    /**
     * Assigns error handling to last added **Task** in the sequence
     */
    onError(...args) {
        //
        return;
    }
    /**
     * Adds a Task to the sequence who's execution is conditional on the evaluation
     * of a supplied function (which is run directly prior to invocation if you're
     * using the `wrapper` function for your **handler**).
     *
     * @param fn the conditional evaluation function
     * @param arn the AWS ARN for the function to call (conditionally); you may use shortcut ARN
     * names so long as you've set the proper ENV variables.
     * @param params the _static_ or _dynamic_ values you want passed to this function
     */
    onCondition(fn, arn, params) {
        this._steps.push({
            arn,
            params,
            onCondition: fn,
            type: "task",
            status: "assigned",
        });
    }
    fanOut(...args) {
        throw new Error("the fanOut functionality is not yet available");
    }
    /**
     * **next**
     *
     * Returns the parameters needed to execute the _invoke()_ function. There
     * are two parameters: `fnArn` and `requestBody`. The first parameter is simply a string
     * representing the fully-qualified AWS **arn** for the function. The `requestBody` is
     * structured like so:
     *
     * ```typescript
     * { body, headers, sequence }
     * ```
     *
     * This structure allows the receiving `LambdaSequence.from()` function to peel
     * off _headers_ and _sequence_ information without any risk of namespace collisions
     * with the returned request object (aka, `body`).
     */
    next(
    /** the _current_ function's response */
    currentFnResponse = {}) {
        this.finishStep(currentFnResponse);
        return this.getInvocationParameters();
    }
    getInvocationParameters() {
        /**
         * Because `activeFn` has been moved forward to the "next function"
         * using the `activeFn` reference is correct
         **/
        let body = this.resolveRequestProperties(this.activeFn);
        let arn = this.activeFn.arn;
        this.validateCallDepth();
        const request = buildOrchestratedRequest(body, this);
        return [arn, request];
    }
    /**
     * Invokes the first function in a new sequence.
     */
    start() {
        return invokeLambda(...this.getInvocationParameters());
    }
    /**
     * Ensures that you can't call yourself in a sequence unless this has been
     * enabled explicitly.
     */
    validateCallDepth() {
        // TODO: implement
    }
    /**
     * **from**
     *
     * unboxes `request`, `sequence`, `apiGateway`, and `headers` data structures
     */
    from(event, 
    // TODO: remove this from API in future
    logger) {
        let apiGateway;
        let headers = {};
        let sequence;
        let request;
        if (isLambdaProxyRequest(event)) {
            apiGateway = { ...{}, ...event };
            headers = apiGateway.headers;
            delete apiGateway.headers;
            request = getBodyFromPossibleLambdaProxyRequest(event);
            sequence = LambdaSequence.notASequence();
            delete apiGateway.body;
        }
        else if (isOrchestratedRequest(event)) {
            headers = decompress(event.headers);
            request = decompress(event.body);
            sequence = LambdaSequence.deserialize(decompress(event.sequence));
        }
        else if (isBareRequest(event)) {
            headers = {};
            sequence =
                typeof event === "object" && event._sequence
                    ? this.ingestSteps(event, event._sequence)
                    : LambdaSequence.notASequence();
            request =
                typeof event === "object" && event._sequence
                    ? Object.keys(event).reduce((props, prop) => {
                        if (prop !== "_sequence") {
                            props[prop] = event[prop];
                        }
                        return props;
                    }, {})
                    : event;
        }
        // The active function's output is sent into the params
        const activeFn = this.activeFn && this.activeFn.params ? this.activeFn.params : {};
        request =
            typeof request === "object"
                ? { ...activeFn, ...request }
                : // TODO: This may have to deal with the case where request type is a non-object but there ARE props from `activeFn` which are needed
                    request;
        return {
            request: request,
            apiGateway,
            sequence,
            headers: headers,
        };
    }
    /**
     * boolean flag which indicates whether the current execution of the function
     * is part of a _sequence_.
     */
    get isSequence() {
        return this._steps && this._steps.length > 0;
    }
    get isDone() {
        return !this.nextFn;
    }
    /**
     * the tasks in the sequence that still remain in the
     * "assigned" category. This excludes those which are
     * completed _and_ any which are _active_.
     */
    get remaining() {
        return this._steps ? this._steps.filter((s) => s.status === "assigned") : [];
    }
    /** the tasks which have been completed */
    get completed() {
        return this._steps ? this._steps.filter((s) => s.status === "completed") : [];
    }
    /** the total number of _steps_ in the sequence */
    get length() {
        return this._steps.length;
    }
    /**
     * **steps**
     *
     * returns the list of steps which have been accumulated
     * so far
     */
    get steps() {
        return this._steps;
    }
    get nextFn() {
        return this.remaining.length > 0 ? this.remaining[0] : undefined;
    }
    /**
     * Sets the currently _active_ function to `completed` and registers
     * the active functions results into the `_responses` dictionary.
     *
     * @param results the results from the activeFn's execution
     */
    finishStep(results) {
        this._responses[this.activeFn.arn] = results;
        this.activeFn.status = "completed";
    }
    get activeFn() {
        if (!this._steps.length) {
            return;
        }
        const log = logger().reloadContext();
        const active = this._steps ? this._steps.filter((s) => s.status === "active") : [];
        if (active.length > 1) {
            log.warn(`There appears to be more than 1 STEP in the sequence marked as active!`, { steps: this._steps });
        }
        if (active.length === 0) {
            const step = this._steps.find((i) => i.status === "assigned");
            if (!step) {
                throw new Error(`Problem resolving activeFn: no step with status "assigned" found. \n\n ${JSON.stringify(this._steps)}`);
            }
            step.status = "active";
            return this.activeFn;
        }
        return active[0];
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
    ingestSteps(request, steps) {
        if (typeof steps === "string") {
            steps = JSON.parse(steps);
        }
        if (this._steps.length > 0) {
            throw new Error(`Attempt to ingest steps into a LambdaSequence that already has steps!`);
        }
        this._steps = steps;
        const activeFnParams = this.activeFn && this.activeFn.params ? this.activeFn.params : {};
        const transformedRequest = typeof request === "object" ? { ...activeFnParams, ...request } : { ...activeFnParams, request };
        /**
         * Inject the prior function's request params into
         * active functions params (set in the conductor)
         */
        this._steps = this._steps.map((s) => {
            return this.activeFn && s.arn === this.activeFn.arn ? { ...s, params: transformedRequest } : s;
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
    get dynamicProperties() {
        return Object.keys(this.activeFn ? this.activeFn.params : {}).reduce((prev, key) => {
            const currentValue = this.activeFn.params[key];
            const valueIsDynamic = String(currentValue).slice(0, 1) === ":";
            return valueIsDynamic ? prev.concat({ key, from: currentValue.slice(1) }) : prev;
        }, []);
    }
    /**
     * Takes a serialized state of a sequence and returns
     * a `LambdaSequence` which represents this state.
     */
    deserialize(s) {
        if (!s.isSequence) {
            return LambdaSequence.notASequence();
        }
        this._steps = s.steps;
        this._responses = s.responses;
        return this;
    }
    toString() {
        return JSON.stringify(this.toObject(), null, 2);
    }
    toObject() {
        const obj = {
            isSequence: this.isSequence,
        };
        if (obj.isSequence) {
            obj.totalSteps = this.steps.length;
            obj.completedSteps = this.completed.length;
            if (this.activeFn) {
                obj.activeFn = this.activeFn.arn;
            }
            if (this.completed) {
                obj.completed = this.completed.map((i) => i.arn);
            }
            if (this.remaining) {
                obj.remaining = this.remaining.map((i) => i.arn);
            }
            obj.steps = this._steps;
            obj.responses = this._responses || {};
        }
        return obj;
    }
    toJSON() {
        return this.toObject();
    }
    /**
     * Determine the request data to pass to the handler function:
     *
     * - Resolve _dynamic_ properties added by Conductor into static values
     * - Add _static_ properties passed in from Conductor
     *
     */
    resolveRequestProperties(fn) {
        return Object.keys(fn.params).reduce((props, key) => {
            let value = fn.params[key];
            if (isDynamic(value)) {
                value = get(this._responses, value.lookup, undefined);
                if (typeof value === undefined) {
                    throw new Error(`The property "${key}" was set as a dynamic property by the Orchestrator but it was dependant on getting a value from ${fn.params[key]} which could not be found.`);
                }
            }
            const valueNow = (key, value) => value;
            props[key] = valueNow(key, value);
            return props;
        }, {});
    }
}
//# sourceMappingURL=LambdaSequence.js.map