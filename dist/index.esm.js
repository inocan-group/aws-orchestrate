import { isLambdaProxyRequest, getBodyFromPossibleLambdaProxyRequest, HttpStatusCodes } from 'common-types';
import { invoke, logger } from 'aws-log';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function size(obj) {
  var size = 0,
      key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }

  return size;
}

var LambdaSequence =
/*#__PURE__*/
function () {
  function LambdaSequence() {
    _classCallCheck(this, LambdaSequence);

    this._steps = [];
    this._isASequence = true;
  }
  /**
   * **add** (static initializer)
   *
   * Instantiates a `LambdaSequence` object and then adds a task to the sequence
   */


  _createClass(LambdaSequence, [{
    key: "add",

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
    value: function add(arn) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "task";

      this._steps.push({
        arn: arn,
        params: params,
        type: type,
        status: "assigned"
      });

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

  }, {
    key: "next",
    value: function next() {
      var _this = this;

      var additionalParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var logger = arguments.length > 1 ? arguments[1] : undefined;

      if (logger) {
        logger.getContext();
      }

      if (this.isDone) {
        if (logger) {
          logger.info("The next() function [ ".concat(this.activeFn.arn, " ] was called but we are now done with the sequence so exiting."));
        }

        return;
      }

      if (logger) {
        logger.info("the next() function is ".concat(this.nextFn.arn), this.toJSON());
      }
      /**
       * if there is an active function, set it to completed
       * and assign _results_
       */


      if (this.activeFn) {
        var results = additionalParams;
        delete results._sequence;
        this.activeFn.results = results;
        this.activeFn.status = "completed";
      } // resolve dynamic props in next function


      this._steps = this._steps.map(function (i) {
        return i.arn === _this.nextFn.arn ? Object.assign(Object.assign({}, i), {
          params: _this.resolveDynamicProperties(_this.nextFn.params, additionalParams)
        }) : i;
      });
      var nextFunctionTuple = [// the arn
      this.nextFn.arn, // the params passed forward
      Object.assign(Object.assign({}, this.nextFn.params), {
        _sequence: this.steps
      })]; // set the next function to active

      this.nextFn.status = "active";
      return nextFunctionTuple;
    }
    /**
     * **from**
     *
     * unboxes request, sequence, and apiGateway data structures
     */

  }, {
    key: "from",
    value: function from(request, logger) {
      var _this2 = this;

      var apiGateway; // separate possible LambdaProxy request from main request

      if (isLambdaProxyRequest(request)) {
        apiGateway = request;
        request = getBodyFromPossibleLambdaProxyRequest(request);
      }

      if (!request._sequence) {
        // there is no sequence property on the request
        if (logger) {
          logger.info("This execution is not part of a sequence");
        }

        return {
          request: request,
          apiGateway: apiGateway,
          sequence: LambdaSequence.notASequence()
        };
      } // looks like a valid sequence


      this._steps = request._sequence; // active function's output is sent into next's params

      var transformedRequest = Object.assign(Object.assign({}, request), this.activeFn.params); // remove the sequence data from the request as this payload will be
      // available in the returned LambdaSequence object

      delete transformedRequest._sequence;
      /**
       * swap out the conductor's generic understanding of params
       * with the actual request params (aka, dynamic props resolved)
       */

      this._steps = this._steps.map(function (s) {
        var resolvedParams = s.arn === _this2.activeFn.arn ? transformedRequest : s.params;
        s.params = resolvedParams;
        return s;
      });

      if (logger) {
        logger.info("This execution is part of a sequence", {
          sequence: String(this)
        });
      }

      return {
        request: transformedRequest,
        apiGateway: apiGateway,
        sequence: this
      };
    }
    /**
     * boolean flag which indicates whether the current execution of the function
     * is part of a _sequence_.
     */

  }, {
    key: "toString",
    value: function toString() {
      return JSON.stringify(this.toObject(), null, 2);
    }
  }, {
    key: "toObject",
    value: function toObject() {
      var obj = {
        isASequence: this._isASequence
      };

      if (this._isASequence) {
        obj.totalSteps = this.steps.length;
        obj.completedSteps = this.completed.length;

        if (this.activeFn) {
          obj.activeFn = {
            arn: this.activeFn.arn,
            params: this.activeFn.params
          };
        }

        if (this.completed) {
          obj.completed = this.completed.map(function (i) {
            return i.arn;
          });
        }

        if (this.remaining) {
          obj.remaining = this.remaining.map(function (i) {
            return i.arn;
          });
        }

        obj.results = this.completed.reduce(function (acc, curr) {
          var objSize = size(curr.results);
          acc[curr.arn] = objSize < 4096 ? curr.results : {
            message: "truncated due to size [ ".concat(objSize, " ]"),
            properties: Object.keys(curr.results)
          };
          return acc;
        }, {});
      }

      return obj;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.toObject();
    }
  }, {
    key: "resolveDynamicProperties",
    value: function resolveDynamicProperties(conductorParams, priorFnResults) {
      var _this3 = this;

      /**
       * Properties on `priorFnResults` which have been remapped by dyamic properties.
       * Note that this only takes place when the conductor's dynamic property is for
       * "last" function's result. If it is from prior results then it these will be considered
       * additive properties and _remapped_ properties
       */
      var remappedProps = [];
      Object.keys(conductorParams).forEach(function (key) {
        var value = conductorParams[key];

        if (typeof value === "string" && value.slice(0, 1) === ":") {
          var lookup = value.slice(1);
          var isFromLastFn = !lookup.includes(".");

          if (isFromLastFn) {
            remappedProps.push(lookup);
            conductorParams[key] = priorFnResults[lookup];
          } else {
            var _lookup$split = lookup.split("."),
                _lookup$split2 = _slicedToArray(_lookup$split, 2),
                fnLookup = _lookup$split2[0],
                fnProp = _lookup$split2[1];

            var relevantStep = _this3.steps.find(function (i) {
              return i.arn === fnLookup;
            });

            conductorParams[key] = relevantStep.results[fnProp];
          }
        }
      });
      return Object.assign(Object.assign({}, Object.keys(priorFnResults).reduce(function (agg, curr) {
        return !remappedProps.includes(curr) ? Object.assign(Object.assign({}, agg), _defineProperty({}, curr, priorFnResults[curr])) : agg;
      }, {})), conductorParams);
    }
  }, {
    key: "isSequence",
    get: function get() {
      return this._isASequence;
    }
  }, {
    key: "isDone",
    get: function get() {
      return this.remaining.length === 0;
    }
    /**
     * the tasks in the sequence that still remain in the
     * "assigned" category. This excludes those which are
     * completed _and_ any which are _active_.
     */

  }, {
    key: "remaining",
    get: function get() {
      return this._steps.filter(function (s) {
        return s.status === "assigned";
      });
    }
    /** the tasks which have been completed */

  }, {
    key: "completed",
    get: function get() {
      return this._steps.filter(function (s) {
        return s.status === "completed";
      });
    }
    /** the total number of _steps_ in the sequence */

  }, {
    key: "length",
    get: function get() {
      return this._steps.length;
    }
    /**
     * **steps**
     *
     * returns the list of steps which have been accumulated
     * so far
     */

  }, {
    key: "steps",
    get: function get() {
      return this._steps;
    }
  }, {
    key: "nextFn",
    get: function get() {
      return this.remaining.length > 0 ? this.remaining[0] : undefined;
    }
  }, {
    key: "activeFn",
    get: function get() {
      var active = this._steps.filter(function (s) {
        return s.status === "active";
      });

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

  }, {
    key: "allHistoricResults",
    get: function get() {
      var completed = this._steps.filter(function (s) {
        return s.status === "completed";
      });

      var result = {};
      completed.forEach(function (s) {
        var fn = s.arn;
        result[fn] = s.results;
      });
      return result;
    }
    /**
     * **dynamicProperties**
     *
     * if the _value_ of a parameter passed to a function leads with the `:`
     * character this is an indicator that it is a "dynamic property" and
     * it's true value should be looked up from the sequence results.
     */

  }, {
    key: "dynamicProperties",
    get: function get() {
      var _this4 = this;

      return Object.keys(this.activeFn.params).reduce(function (prev, key) {
        var currentValue = _this4.activeFn.params[key];
        var valueIsDynamic = String(currentValue).slice(0, 1) === ":";
        return valueIsDynamic ? prev.concat({
          key: key,
          from: currentValue.slice(1)
        }) : prev;
      }, []);
    }
  }], [{
    key: "add",
    value: function add(arn) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "task";
      var obj = new LambdaSequence();
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

  }, {
    key: "from",
    value: function from(event, logger) {
      var obj = new LambdaSequence();
      return obj.from(event, logger);
    }
  }, {
    key: "notASequence",
    value: function notASequence() {
      var obj = new LambdaSequence();
      obj._steps = [];
      obj._isASequence = false;
      return obj;
    }
  }]);

  return LambdaSequence;
}();

/**
 * **LambdaEventParser**
 *
 * Ensures that the _typed_ `request` is separated from a possible Proxy Integration
 * Request that would have originated from API Gateway; also returns the `apiGateway`
 * payload with the "body" removed (as it would be redundant to the request).
 *
 * Typical usage is:
 *
```typescript
const { request, apiGateway } = LambdaEventParser.parse(event);
```
 *
 * this signature is intended to mimic the `LambdaSequence.from(event)` API but
 * without the parsing of a `sequence` property being extracted.
 */

var LambdaEventParser =
/*#__PURE__*/
function () {
  function LambdaEventParser() {
    _classCallCheck(this, LambdaEventParser);
  }

  _createClass(LambdaEventParser, null, [{
    key: "parse",

    /**
     * **parse**
     *
     * A static method which returns an object with both `request` and `apiGateway`
     * properties. The `request` is typed to **T** and the `apiGateway` will be a
     * `IAWSLambdaProxyIntegrationRequest` object with the "body" removed _if_
     * the event came from **API Gateway** otherwise it will be undefined.
     */
    value: function parse(event) {
      var request = isLambdaProxyRequest(event) ? JSON.parse(event.body) : event;

      if (isLambdaProxyRequest(event)) {
        delete event.body;
      } else {
        event = undefined;
      }

      return {
        request: request,
        apiGateway: event
      };
    }
  }]);

  return LambdaEventParser;
}();

/**
 * Allows the definition of a serverless function's
 * expected error code
 */
var ErrorHandler =
/*#__PURE__*/
function () {
  function ErrorHandler(code, identifiedBy, handling) {
    _classCallCheck(this, ErrorHandler);

    this.code = code;
    this.identifiedBy = identifiedBy;
    this.handling = handling;
  }

  _createClass(ErrorHandler, [{
    key: "toString",
    value: function toString() {
      return {
        code: this.code,
        identifiedBy: this.identifiedBy,
        handling: this.handling
      };
    }
  }]);

  return ErrorHandler;
}();

var DEFAULT_ERROR_CODE = 500;
/**
 * Is a container for a serverless function that
 * describes:
 *
 * 1. What errors are _expected_
 * 2. **Meta** for all errors -- expected and unexpected -- on:
 *    - the return's exit code (which is typically a reduced set from the errors themselves)
 *    - how to handle them (do something in the _current fn_ or pass to a _handling function_)
 *
 * By default, all errors are given a 500 exit code and log the error at the "error" severity
 * level but perform no additional work.
 */

var ErrorMeta =
/*#__PURE__*/
function () {
  function ErrorMeta() {
    _classCallCheck(this, ErrorMeta);

    this._errors = [];
    this._defaultErrorCode = DEFAULT_ERROR_CODE;
  }
  /**
   * Add an error handler for a known/expected error
   */


  _createClass(ErrorMeta, [{
    key: "addHandler",
    value: function addHandler(
    /** the return code that will be returned for this error */
    code,
    /** how will an error be matched */
    identifiedBy,
    /**
     * how will an error be handled; it doesn't NEED to be handled and its a reasonable
     * goal/outcome just to set the appropriate http error code
     */
    handling) {
      this._errors.push(new ErrorHandler(code, identifiedBy, handling));
    }
    /**
     * Returns the list of errors being managed.
     */

  }, {
    key: "setDefaultErrorCode",

    /**
     * Allows you to set a default code for unhandled errors; the default is
     * `500`. This method follows the _fluent_ conventions and returns and instance
     * of itself as a return value.
     *
     * Note: if an unhandled error has the property of `httpStatus` set and is a number
     * then it will be respected over the default.
     */
    value: function setDefaultErrorCode(code) {
      this._defaultErrorCode = code;
      return this;
    }
  }, {
    key: "setDefaultHandler",
    value: function setDefaultHandler(param) {
      switch (_typeof(param)) {
        case "string":
          this._arn = param;
          this._defaultHandlerFn = undefined;
          this._defaultError = undefined;
          break;

        case "function":
          this._defaultHandlerFn = param;
          this._arn = undefined;
          this._defaultError = undefined;
          break;

        default:
          if (param instanceof Error) {
            this._defaultError = param;
            this._arn = undefined;
            this._defaultHandlerFn = undefined;
          } else {
            console.log({
              message: "The passed in setDefaultHandler param was of an unknown type ".concat(_typeof(param), "; the action has been ignored")
            });
          }

      }

      return this;
    }
  }, {
    key: "toString",
    value: function toString() {
      return JSON.stringify({
        defaultCode: this._defaultErrorCode,
        errors: this._errors
      });
    }
  }, {
    key: "list",
    get: function get() {
      return this._errors;
    }
  }, {
    key: "defaultHandling",
    get: function get() {
      if (this._arn) {
        return {
          type: "error-forwarding",
          code: this.defaultErrorCode,
          arn: this._arn,
          prop: "_arn"
        };
      }

      if (this._defaultHandlerFn) {
        return {
          type: "handler-fn",
          code: this.defaultErrorCode,
          defaultHandlerFn: this._defaultHandlerFn,
          prop: "_defaultHandlerFn"
        };
      }

      if (this._defaultError) {
        return {
          type: "default-error",
          code: this.defaultErrorCode,
          error: this._defaultError,
          prop: "_defaultError"
        };
      }
    }
    /**
     * The default code for unhandled errors.
     *
     * Note: if an unhandled error has the property of `httpStatus` set and is a number
     * then it will be respected over the default.
     */

  }, {
    key: "defaultErrorCode",
    get: function get() {
      return this._defaultErrorCode;
    }
  }]);

  return ErrorMeta;
}();

var UnhandledError =
/*#__PURE__*/
function (_Error) {
  _inherits(UnhandledError, _Error);

  /**
   * **Constructor**
   *
   * @param errorCode the numeric HTTP error code
   * @param e the error which wasn't handled
   * @param classification the type/subtype of the error; if only `subtype` stated then
   * type will be defaulted to `unhandled-error`
   */
  function UnhandledError(errorCode, e, classification) {
    var _this;

    _classCallCheck(this, UnhandledError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UnhandledError).call(this, e.message));
    _this.stack = e.stack;
    classification = classification || "unhandled-error/".concat(e.name);
    classification = classification.includes("/") ? classification : "unhandled-error/".concat(classification);

    var _classification$split = classification.split("/"),
        _classification$split2 = _slicedToArray(_classification$split, 2),
        type = _classification$split2[0],
        subType = _classification$split2[1];

    _this.name = type;
    _this.code = subType;
    _this.httpStatus = errorCode;
    return _this;
  }
  /**
   * Create a serialized/string representation of the error
   * for returning to **API Gateway**
   */


  _createClass(UnhandledError, null, [{
    key: "apiGatewayError",
    value: function apiGatewayError(errorCode, e, requestId, classification) {
      var obj = new UnhandledError(errorCode, e, classification);
      obj.requestId = requestId;
      return {
        statusCode: obj.httpStatus,
        errorType: obj.name,
        errorMessage: obj.message,
        stackTrace: obj.stack,
        body: JSON.stringify({
          requestId: obj.requestId,
          classification: classification
        })
      };
    }
    /**
     * creates an error to be thrown by a **Lambda** function which
     * was initiatiated by a
     */

  }, {
    key: "lambdaError",
    value: function lambdaError(errorCode, e, classification) {
      var obj = new UnhandledError(errorCode, e, classification);
    }
  }]);

  return UnhandledError;
}(_wrapNativeSuper(Error));

/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 * If _not_ found then return `false`.
 */
function findError(e, expectedErrors) {
  var found = false;
  expectedErrors.list.forEach(function (i) {
    if (e.code === i.identifiedBy.code || e.name == i.identifiedBy.name || e.message.includes(i.identifiedBy.messageContains) || e instanceof i.identifiedBy.errorClass) {
      found = i;
    }
  });
  return found;
}

var HandledError =
/*#__PURE__*/
function (_Error) {
  _inherits(HandledError, _Error);

  /**
   * **Constructor**
   *
   * @param errorCode the numeric HTTP error code
   * @param e the error which wasn't handled
   * @param classification the type/subtype of the error; if only `subtype` stated then
   * type will be defaulted to `handled-error`
   */
  function HandledError(errorCode, e, context) {
    var _this;

    _classCallCheck(this, HandledError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HandledError).call(this, e.message));
    _this.stack = e.stack;
    var type = e.name && e.name !== "Error" ? e.name : context.functionName;
    var subType = e.code ? String(e.code) : "handled-error";
    _this.classification = "".concat(type, "/").concat(subType);
    _this.functionName = context.functionName;
    _this.name = type;
    _this.code = subType;
    _this.httpStatus = errorCode;
    return _this;
  }
  /**
   * Create a serialized/string representation of the error
   * for returning to **API Gateway**
   */


  _createClass(HandledError, null, [{
    key: "apiGatewayError",
    value: function apiGatewayError(errorCode, e, context) {
      var obj = new HandledError(errorCode, e, context);
      return JSON.stringify({
        errorType: obj.name,
        httpStatus: obj.httpStatus,
        requestId: obj.requestId,
        message: obj.message
      });
    }
    /**
     * creates an error to be thrown by a **Lambda** function which
     * was initiatiated by a
     */

  }, {
    key: "lambdaError",
    value: function lambdaError(errorCode, e, context) {
      var obj = new HandledError(errorCode, e, context);
    }
  }]);

  return HandledError;
}(_wrapNativeSuper(Error));

/**
 * **getSecrets**
 *
 * gets the needed module secrets; using locally available information if available, otherwise
 * going out SSM to get.
 *
 * @param modules the modules which are have secrets that are needed for the functions execution.
 * @param localLookup the property to look for the secrets in the incoming event/request
 */
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

function getSecrets(event) {
  return _async(function (modules, localLookup) {
    if (localLookup && event && event[localLookup]) {
      var localModules = Object.keys(event[localLookup]);

      if (localModules.every(function (i) {
        return modules.includes(i);
      })) {
        return event[localLookup];
      }
    }

    return _await(import('aws-ssm'), function (_temp) {
      var SSM = _temp.SSM;
      return _await(SSM.modules(modules));
    });
  });
}

function _await$1(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

var _database;
/**
 * **database**
 *
 * Provides a convenient means to connect to the database which lives
 * outside the _handler_ function's main thread. This allows the connection
 * to the database to sometimes be preserved between function executions.
 *
 * This is loaded asynchronously and the containing code must explicitly
 * load the `abstracted-admin` library (as this library only lists it as
 * a devDep)
 */


function _invoke(body, then) {
  var result = body();

  if (result && result.then) {
    return result.then(then);
  }

  return then(result);
}

function _async$1(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

var database = _async$1(function (config) {
  return _invoke(function () {
    if (!_database) {
      return _await$1(import('abstracted-admin'), function (_temp) {
        var DB = _temp.DB;
        return _await$1(DB.connect(config), function (_DB$connect) {
          _database = _DB$connect;
        });
      });
    }
  }, function () {
    return _database;
  });
});

function _await$2(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

function _async$2(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

var invokeNewSequence = _async$2(function () {
  var results = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var log = arguments.length > 1 ? arguments[1] : undefined;

  {
    return;
  }

  results = results || {};
  return _await$2(invoke.apply(void 0, _toConsumableArray(sequence.next(_typeof(results) === "object" ? results : {
    data: results
  }))), function () {
    log.info("The new sequence has been kicked off");
  });
});
var sequence;
function startSequence(log, context) {
  return function (sequence) {
    log.info("This function [ ".concat(context.functionName, " ] will kick off a new sequence with ").concat(sequence.steps.length, " steps."), {
      sequence: sequence
    });
  };
}

/**
 * Ensures that frontend clients who call Lambda's
 * will be given a CORs friendly response
 */
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};
var contentType = "application/json";
var fnHeaders = {};
var correlationId;
function getContentType() {
  return contentType;
}
function setContentType(type) {
  if (!type.includes("/")) {
    throw new Error("The value sent to setContentType (\"".concat(type, "\") is not valid; it must be a valid MIME type."));
  }

  contentType = type;
}
function getHeaders() {
  return fnHeaders;
}
/**
 * set the `correlationId` so it is always passed
 * as a header variable on responses and invocations
 */

function setCorrelationId(cid) {
  correlationId = cid;
}
function getAllHeaders() {
  return Object.assign(Object.assign(Object.assign({}, CORS_HEADERS), getHeaders()), {
    "Content-Type": getContentType(),
    "x-correlation-id": correlationId
  });
}
function setHeaders(headers) {
  if (_typeof(headers) !== "object") {
    throw new Error("The value sent to setHeaders is not the required type. Was \"".concat(_typeof(headers), "\"; expected \"object\"."));
  }

  fnHeaders = headers;
}

/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */

function convertToApiGatewayError(e) {
  var defaultCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_ERROR_CODE;
  return {
    headers: getAllHeaders(),
    errorCode: e.errorCode || defaultCode,
    errorType: e.name || e.code || "Error",
    errorMessage: e.message,
    stackTrace: e.stack
  };
}

/**
 * **wrapper**
 *
 * A higher order function which wraps a serverless _handler_-function with the aim of providing
 * a better typing, logging, and orchestration experience.
 *
 * @param event will be either the body of the request or the hash passed in by API Gateway
 * @param context the contextual props and functions which AWS provides
 */

function _await$3(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

function _invoke$1(body, then) {
  var result = body();

  if (result && result.then) {
    return result.then(then);
  }

  return then(result);
}

function _empty() {}

function _invokeIgnored(body) {
  var result = body();

  if (result && result.then) {
    return result.then(_empty);
  }
}

function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }

        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }

    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }

    pact.s = state;
    pact.v = value;
    var observer = pact.o;

    if (observer) {
      observer(pact);
    }
  }
}

var _Pact =
/*#__PURE__*/
function () {
  function _Pact() {}

  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;

    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;

      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }

        return result;
      } else {
        return this;
      }
    }

    this.o = function (_this) {
      try {
        var value = _this.v;

        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };

    return result;
  };

  return _Pact;
}();

function _switch(discriminant, cases) {
  var dispatchIndex = -1;
  var awaitBody;

  outer: {
    for (var i = 0; i < cases.length; i++) {
      var test = cases[i][0];

      if (test) {
        var testValue = test();

        if (testValue && testValue.then) {
          break outer;
        }

        if (testValue === discriminant) {
          dispatchIndex = i;
          break;
        }
      } else {
        // Found the default case, set it as the pending dispatch case
        dispatchIndex = i;
      }
    }

    if (dispatchIndex !== -1) {
      do {
        var body = cases[dispatchIndex][1];

        while (!body) {
          dispatchIndex++;
          body = cases[dispatchIndex][1];
        }

        var result = body();

        if (result && result.then) {
          awaitBody = true;
          break outer;
        }

        var fallthroughCheck = cases[dispatchIndex][2];
        dispatchIndex++;
      } while (fallthroughCheck && !fallthroughCheck());

      return result;
    }
  }

  var pact = new _Pact();

  var reject = _settle.bind(null, pact, 2);

  (awaitBody ? result.then(_resumeAfterBody) : testValue.then(_resumeAfterTest)).then(void 0, reject);
  return pact;

  function _resumeAfterTest(value) {
    for (;;) {
      if (value === discriminant) {
        dispatchIndex = i;
        break;
      }

      if (++i === cases.length) {
        if (dispatchIndex !== -1) {
          break;
        } else {
          _settle(pact, 1, result);

          return;
        }
      }

      test = cases[i][0];

      if (test) {
        value = test();

        if (value && value.then) {
          value.then(_resumeAfterTest).then(void 0, reject);
          return;
        }
      } else {
        dispatchIndex = i;
      }
    }

    do {
      var body = cases[dispatchIndex][1];

      while (!body) {
        dispatchIndex++;
        body = cases[dispatchIndex][1];
      }

      var result = body();

      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
        return;
      }

      var fallthroughCheck = cases[dispatchIndex][2];
      dispatchIndex++;
    } while (fallthroughCheck && !fallthroughCheck());

    _settle(pact, 1, result);
  }

  function _resumeAfterBody(result) {
    for (;;) {
      var fallthroughCheck = cases[dispatchIndex][2];

      if (!fallthroughCheck || fallthroughCheck()) {
        break;
      }

      dispatchIndex++;
      var body = cases[dispatchIndex][1];

      while (!body) {
        dispatchIndex++;
        body = cases[dispatchIndex][1];
      }

      result = body();

      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
        return;
      }
    }

    _settle(pact, 1, result);
  }
}

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

function _async$3(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

var wrapper = function wrapper(fn) {
  return _async$3(function (event, context) {
    var result;
    var workflowStatus = "initializing";
    context.callbackWaitsForEmptyEventLoop = false;
    var log = logger().lambda(event, context);
    var errorMeta = new ErrorMeta();
    return _catch(function () {
      var _LambdaSequence$from = LambdaSequence.from(event),
          request = _LambdaSequence$from.request,
          sequence = _LambdaSequence$from.sequence,
          apiGateway = _LambdaSequence$from.apiGateway;

      setCorrelationId(log.getCorrelationId());
      log.info("The handler function \"".concat(context.functionName, "\" has started execution.  ").concat(sequence.isSequence ? "This handler is part of a sequence [".concat(log.getCorrelationId(), " ].") : "This handler was not triggered as part of a sequence."), {
        clientContext: context.clientContext,
        request: request,
        sequence: sequence,
        apiGateway: apiGateway
      });
      var startSequence$1 = startSequence(log, context);
      var handlerContext = Object.assign(Object.assign({}, context), {
        log: log,
        setHeaders: setHeaders,
        setContentType: setContentType,
        database: database,
        sequence: sequence,
        startSequence: startSequence$1,
        isSequence: sequence.isSequence,
        isDone: sequence.isDone,
        apiGateway: apiGateway,
        getSecrets: getSecrets(request),
        isApiGatewayRequest: apiGateway && apiGateway.headers ? true : false,
        errorMgmt: errorMeta
      });
      workflowStatus = "running-function"; // CALL the HANDLER FUNCTION

      return _await$3(fn(request, handlerContext), function (_fn) {
        result = _fn;
        workflowStatus = "function-complete"; // SEQUENCE (continuation)

        return _invoke$1(function () {
          if (sequence.isSequence && !sequence.isDone) {
            workflowStatus = "invoke-started";
            return _await$3(invoke.apply(void 0, _toConsumableArray(sequence.next(result))), function () {
              workflowStatus = "invoke-complete";
            });
          }
        }, function () {
          // SEQUENCE (orchestration starting)
          return _await$3(invokeNewSequence(result, log), function () {
            // RETURN
            var headers = getAllHeaders();

            if (handlerContext.isApiGatewayRequest) {
              var response = {
                statusCode: HttpStatusCodes.Success,
                headers: headers,
                body: JSON.stringify(result)
              };
              log.debug("Returning results to API Gateway", {
                statusCode: 200,
                headers: headers,
                result: result
              });
              return response;
            } else {
              log.debug("Returning results to non-API Gateway caller", {
                result: result
              });
              return result;
            }
          }); // END of RETURN BLOCK
        });
      });
    }, function (e) {
      log.info("Processing error in handler function: ".concat(e.message), {
        error: e,
        workflowStatus: workflowStatus
      });
      var found = findError(e, errorMeta);
      var isApiGatewayRequest = _typeof(event) === "object" && event.headers ? true : false;
      return function () {
        if (found) {
          if (found.handling.callback) {
            var resolved = found.handling.callback(e);

            if (!resolved) {
              if (isApiGatewayRequest) {
                return convertToApiGatewayError(new HandledError(found.code, e, log.getContext()));
              } else {
                throw new HandledError(found.code, e, log.getContext());
              }
            }
          }

          return _invokeIgnored(function () {
            if (found.handling.forwardTo) {
              return _await$3(invoke(found.handling.forwardTo, e), function () {
                log.info("Forwarded error to the function \"".concat(found.handling.forwardTo, "\""), {
                  error: e,
                  forwardTo: found.handling.forwardTo
                });
              });
            }
          });
        } else {
          // UNFOUND ERROR
          log.debug("An unfound error is being processed by the default handling mechanism", {
            defaultHandling: errorMeta.defaultHandling,
            errorMessage: e.message,
            stack: e.stack
          });
          var handling = errorMeta.defaultHandling;
          return _switch(handling.type, [[function () {
            return "handler-fn";
          }, function () {
            //#region handle-fn

            /**
             * results are broadly three things:
             *
             * 1. handler throws an error
             * 2. handler returns `true` which means that result should be considered successful
             * 3. handler returns _falsy_ which means that the default error should be thrown
             */
            try {
              var passed = handling.defaultHandlerFn(e);

              if (passed === true) {
                log.debug("The error was fully handled by the handling function/callback; resulting in a successful condition.");

                if (isApiGatewayRequest) {
                  return {
                    statusCode: result ? HttpStatusCodes.Success : HttpStatusCodes.NoContent,
                    headers: getAllHeaders(),
                    body: result ? JSON.stringify(result) : ""
                  };
                } else {
                  return result;
                }
              } else {
                log.debug("The error was passed to the callback/handler function but it did NOT resolve the error condition.");
              }
            } catch (e2) {
              // handler threw an error
              log.debug("the handler function threw an error: ".concat(e2.message), {
                messsage: e2.message,
                stack: e2.stack
              });

              if (isApiGatewayRequest) {
                return convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, e));
              }
            }
          }], [function () {
            return "error-forwarding";
          }, function () {
            //#region error-forwarding
            log.debug("The error will be forwarded to another function for handling", {
              arn: handling.arn
            });
            return _await$3(invoke(handling.arn, e), function () {
            });
          }], [function () {
            return "default-error";
          }, function () {
            //#region default-error
            handling.error.message = handling.error.message || e.message;
            handling.error.stack = e.stack;

            if (isApiGatewayRequest) {
              return convertToApiGatewayError(handling.error);
            } else {
              throw handling.error;
            }
          }], [function () {
            return "default";
          }, function () {
            //#region default
            log.debug("Error handled by default unknown policy");

            if (isApiGatewayRequest) {
              return convertToApiGatewayError(new UnhandledError(errorMeta.defaultErrorCode, e));
            } else {
              throw new UnhandledError(errorMeta.defaultErrorCode, e);
            }
          }], [void 0, function () {
            log.debug("Unknown handling technique for unhandled error", {
              type: handling.type,
              errorMessage: e.message
            });
            throw new UnhandledError(errorMeta.defaultErrorCode, e);
          }]]);
        }
      }();
    });
  });
};

export { LambdaEventParser, LambdaSequence, wrapper };
