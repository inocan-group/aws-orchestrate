'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
  if (e && e.__esModule) { return e; } else {
    var n = {};
    if (e) {
      Object.keys(e).forEach(function (k) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      });
    }
    n['default'] = e;
    return n;
  }
}

var commonTypes = require('common-types');
var lzutf8 = require('lzutf8');
var awsLog = require('aws-log');
var get = _interopDefault(require('lodash.get'));
var flatten = _interopDefault(require('lodash.flatten'));
var set = _interopDefault(require('lodash.set'));

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
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

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

/**
 * detects if the given structure is of type <T> or
 * has been boxed into an `IOrchestratedMessageBody`
 */
function isOrchestratedRequest(msg) {
  return _typeof(msg) === "object" && msg.type === "orchestrated-message-body" ? true : false;
}

/**
 * Serializes a `LambdaSequence` into a string representation
 * so it can be passed as a header parameter in HTTP responses
 * as well invokation requests to other Lambda functions.
 */
function serializeSequence(s) {
  return;
}

/**
 * A higher order function which first takes a `correlationId` and returns a function which provides
 * a simple status of the sequence.
 */
var sequenceStatus = function sequenceStatus(correlationId) {
  return (
    /**
     * Reduces a sequence object to a simple "status" based representation
     */
    function (s, dataOrError) {
      var status = s.isDone ? dataOrError instanceof Error ? "error" : "success" : "running";
      var response = {
        status: status,
        correlationId: correlationId,
        currentFn: s.activeFn ? s.activeFn.arn : "",
        originFn: s.activeFn ? s.steps[0].arn : "",
        total: s.steps.length,
        current: s.completed.length
      };

      switch (status) {
        case "error":
          return Object.assign(Object.assign({}, response), {
            error: dataOrError
          });

        case "success":
          return Object.assign(Object.assign({}, response), {
            data: dataOrError
          });

        case "running":
          return response;
      }
    }
  );
};

/**
 * A helper function for Orchestrators which produces a
 * dynamic reference. Usage would be:
 *
 * ```typescript
 * LambdaSequence
 *  .add('myFirstFn')
 *  .add('mySecondFn', { foo: dynamic<IFirstResponse>('myFirstFn', 'data') })
 * ```
 *
 * This will take the `data` output from **myFirstFn** and pass it into **mySecondFn**
 * as the property `foo`. If you pass in a generic type to `dynamic` it will enforce
 * the property name is indeed a response property for the given function.
 */
function dynamic(fn, prop) {
  return {
    type: "orchestrated-dynamic-property",
    lookup: "".concat(fn).concat(prop ? ".".concat(prop) : "")
  };
}
function isDynamic(obj) {
  return obj.type === "orchestrated-dynamic-property" && obj.lookup ? true : false;
}

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
 * compresses large payloads larger than 4k (or whatever size
 * you state in the second parameter)
 */

function compress(data, ifLargerThan) {
  var payload;

  if (typeof data !== "string") {
    payload = JSON.stringify(data);
  } else {
    payload = data;
  }

  if (payload.length > (ifLargerThan || 4096)) {
    return {
      compressed: true,
      data: compressionHandler(payload)
    };
  } else {
    return data;
  }
}

function compressionHandler(data) {
  try {
    return lzutf8.compress(data, {
      inputEncoding: "String",
      outputEncoding: "Base64"
    });
  } catch (e) {
    e.message = "Problem compressing section. Error message: ".concat(e.message, "\n\nText being compressed started with: ").concat(data.slice(0, 10));
    throw new UnhandledError(commonTypes.HttpStatusCodes.Conflict, e, "aws-orchestrate/decompress");
  }
}

function isCompressedSection(data) {
  return _typeof(data) === "object" && data.compressed === true ? true : false;
}
function decompress(data) {
  var parse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var parser = parse ? JSON.parse : function (a) {
    return a;
  };
  return isCompressedSection(data) ? parser(decompressionHandler(data)) : data;
}

function decompressionHandler(section) {
  try {
    return lzutf8.decompress(section.data, {
      inputEncoding: "Base64",
      outputEncoding: "String"
    });
  } catch (e) {
    e.message = "Problem decompressing section. Error message: ".concat(e.message, "\n\nText being decompressed started with: ").concat(section.data.slice(0, 10));
    throw new UnhandledError(commonTypes.HttpStatusCodes.Conflict, e, "aws-orchestrate/decompress");
  }
}

function isBareRequest(event) {
  return !commonTypes.isLambdaProxyRequest(event) && !isOrchestratedRequest(event) ? true : false;
}

/**
 * Allows getting a single secret out of either _locally_ stored secrets -- or
 * if not found -- going to **SSM** and pulling the module containing this secret.
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
/**
 * **getSecrets**
 *
 * Gets the needed secrets for this function -- using locally available information
 * if available (_params_ and/or _cached_ values from prior calls) -- otherwise
 * goes out **SSM** to get it.
 *
 * In addition, all secrets requested (within the given function as well as
 * _prior_ function's secrets in a sequence) will be auto-forwarded to subsequent
 * functions in the currently executing sequence. Secrets _will not_ be passed back
 * in the function's response.
 *
 * @param modules the modules which are have secrets that are needed; you may add an array
 * as the first parameter passed in or you can destructure values across the input
 */


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

var getSecrets = _async(function () {
  for (var _len = arguments.length, modules = new Array(_len), _key = 0; _key < _len; _key++) {
    modules[_key] = arguments[_key];
  }

  var mods = flatten(modules);
  var log = awsLog.logger().reloadContext();
  var localSecrets = getLocalSecrets();

  if (mods.every(function (i) {
    return Object.keys(localSecrets).includes(i);
  })) {
    // everything found in local secrets
    log.debug("Call to getSecrets() resulted in 100% hit rate for modules locally", {
      modules: mods
    });
    return mods.reduce(function (secrets, mod) {
      secrets[mod] = localSecrets[mod];
      return secrets;
    }, {});
  } // at least SOME modules are NOT stored locally, the latency of getting some
  // versus getting them all is negligible so we'll get them all from SSM


  log.debug("Some modules requested were not found locally, requesting from SSM.", {
    modules: mods
  });
  return _await(new Promise(function (resolve) { resolve(_interopNamespace(require('aws-ssm'))); }), function (_temp) {
    var SSM = _temp.SSM;
    return _await(SSM.modules(mods), function (newSecrets) {
      mods.forEach(function (m) {
        if (!newSecrets[m]) {
          throw new Error("Failure to retrieve the SSM module \"".concat(m, "\""));
        }

        if (Object.keys(newSecrets[m]).length === 0) {
          log.warn("Attempt to retrieve module \"".concat(m, "\" returned but had no "));
        }
      });
      log.debug("new SSM modules retrieved");
      var secrets = Object.assign(Object.assign({}, localSecrets), newSecrets);
      saveSecretsLocally(secrets);
      maskLoggingForSecrets(newSecrets, log);
      return secrets;
    });
  });
});
/**
 * Goes through a set of secrets -- organized by `[module].[name] = secret` --
 * and masks the values so that they don't leak into the log files.
 */

var getSecret = _async(function (moduleAndName) {
  var log = awsLog.logger().reloadContext();
  var localSecrets = getLocalSecrets();

  if (!moduleAndName.includes("/")) {
    throw new Error("When using getSecret() you must state both the module and the NAME of the secret where the two are delimited by a \"/\" character. Instead \"".concat(moduleAndName, "\" was passed in. If you want to get all the secrets for a given module you should be using getSecrets() instead."));
  }

  var _moduleAndName$split = moduleAndName.split("/"),
      _moduleAndName$split2 = _slicedToArray(_moduleAndName$split, 2),
      module = _moduleAndName$split2[0],
      name = _moduleAndName$split2[1];

  if (get(localSecrets, "".concat(module, ".").concat(name), false)) {
    log.debug("getSecret(\"".concat(moduleAndName, "\") found secret locally"), {
      module: module,
      name: name
    });
    return get(localSecrets, "".concat(module, ".").concat(name));
  } else {
    log.debug("getSecret(\"".concat(moduleAndName, "\") did not find locally so asking SSM for module \"").concat(module, "\""), {
      module: module,
      name: name,
      localModules: Object.keys(localSecrets)
    });
    return _await(getSecrets(module), function () {
      if (get(localSecrets, "".concat(module, ".").concat(name), false)) {
        log.debug("after SSM call for module \"".concat(module, "\" the secret was found"), {
          module: module,
          name: name
        });
        return get(localSecrets, "".concat(module, ".").concat(name));
      } else {
        throw new Error("Even after asking SSM for module \"".concat(module, "\" the secret \"").concat(name, "\" was not found!"));
      }
    });
  }
});
var localSecrets = {};
/**
 * Saves secrets locally so they can be used rather than
 * going out to SSM. These secrets will then also be "passed
 * forward" to any functions which are invoked.
 */

function saveSecretsLocally(secrets) {
  localSecrets = secrets;
}
/**
 * Gets the locally stored secrets. The format of the keys in this hash
 * should be `{ module1: { NAME: value, NAME2: value} }` which cooresponds
 * to the `aws-ssm` opinion on SSM naming.
 */

function getLocalSecrets() {
  return localSecrets;
}
function maskLoggingForSecrets(modules, log) {
  var secretPaths = [];
  Object.keys(modules).forEach(function (mod) {
    Object.keys(mod).forEach(function (s) {
      if (_typeof(s) === "object") {
        log.addToMaskedValues(modules[mod][s]);
        secretPaths.push("".concat(mod, "/").concat(s));
      }
    });
  });

  if (secretPaths.length > 0) {
    log.debug("All secret values [ ".concat(secretPaths.length, " ] have been masked in logging"), {
      secretPaths: secretPaths
    });
  } else {
    log.debug("No secrets where added in this function's call; no additional log masking needed.");
  }
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
function getContentType() {
  return contentType;
}
/**
 * By passing in all the headers you received in a given
 * invocation this function will pull out all the headers
 * which start with `O-S-` (as this is the convention for
 * secrets passed by `aws-orchestrate`). Each line item in
 * a header represents a secret name/value pairing. For instance,
 * A typical header might be keyed with `O-S-firemodel/SERVICE_ACCOUNT`.
 *
 * Each header name/value will be parsed and then stored in following format:
 *
 * ```typescript
 * {
 *    [module1]: {
 *      secret1: value,
 *      secret2: value
 *    },
 *    [module2]: {
 *      secret3: value
 *    }
 * }
 * ```
 *
 * This format is consistent with the opinionated format established by
 * the `aws-ssm` library. This data structure can be retrieved at any
 * point by a call to `getLocalSecrets()`.
 */

function saveSecretHeaders(headers, log) {
  var secrets = [];
  var localSecrets = Object.keys(headers).reduce(function (headerSecrets, key) {
    if (key.slice(0, 4) === "O-S-") {
      var _key$slice$split = key.slice(4).split("/"),
          _key$slice$split2 = _slicedToArray(_key$slice$split, 2),
          module = _key$slice$split2[0],
          name = _key$slice$split2[1];

      var dotPath = "".concat(module, ".").concat(name);
      set(headerSecrets, dotPath, headers[key]);
      secrets.push(dotPath);
    }

    return headerSecrets;
  }, {});

  if (secrets.length > 0) {
    log.debug("Secrets [ ".concat(secrets.length, " ] from headers were identified"), {
      secrets: secrets
    });
  }

  saveSecretsLocally(localSecrets);
  return localSecrets;
}
/**
 * Takes all of the saved local secrets and puts them into the right format
 * for being passed in the header of forwarding invocation.
 */

function getHeaderSecrets() {
  var log = awsLog.logger().reloadContext();
  var modules = getLocalSecrets();
  return Object.keys(modules).reduce(function (headerSecrets, mod) {
    var secrets = modules[mod];

    if (_typeof(secrets) === "object") {
      Object.keys(secrets).forEach(function (secret) {
        headerSecrets["O-S-".concat(mod, "/").concat(secret)] = modules[mod][secret];
      });
    } else {
      log.warn("Attempt to generate header secrets but module \"".concat(mod, "\" is not a hash of name/values. Ignoring this module but continuing."), {
        module: mod,
        type: _typeof(secrets),
        localModules: Object.keys(modules)
      });
    }

    return headerSecrets;
  }, {});
}
function setContentType(type) {
  if (!type.includes("/")) {
    throw new Error("The value sent to setContentType (\"".concat(type, "\") is not valid; it must be a valid MIME type."));
  }

  contentType = type;
}
/**
 * Get the user/developer defined headers for this function
 */

function getFnHeaders() {
  return fnHeaders;
}
function setFnHeaders(headers) {
  if (_typeof(headers) !== "object") {
    throw new Error("The value sent to setHeaders is not the required type. Was \"".concat(_typeof(headers), "\"; expected \"object\"."));
  }

  fnHeaders = headers;
}

function getBaseHeaders(opts) {
  var _ref;

  var correlationId = awsLog.getCorrelationId();
  var sequenceInfo = opts.sequence ? (_ref = {}, _defineProperty(_ref, "O-Sequence-Status", JSON.stringify(sequenceStatus(correlationId)(opts.sequence))), _defineProperty(_ref, "O-Serialized-Sequence", serializeSequence(opts.sequence)), _ref) : {};
  return Object.assign(Object.assign(Object.assign({}, sequenceInfo), getFnHeaders()), _defineProperty({}, "X-Correlation-Id", awsLog.getCorrelationId()));
}
/**
 * All the HTTP _Response_ headers to send when returning to API Gateway
 */


function getResponseHeaders() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.assign(Object.assign(Object.assign({}, getBaseHeaders(opts)), CORS_HEADERS), {
    "Content-Type": getContentType()
  });
}
/**
 * All the HTTP _Request_ headers to send when calling
 * another function
 */

function getRequestHeaders() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.assign(Object.assign({}, getHeaderSecrets()), getBaseHeaders(opts));
}

var LambdaSequence =
/*#__PURE__*/
function () {
  function LambdaSequence() {
    _classCallCheck(this, LambdaSequence);

    /**
     * The steps defined in the sequence
     */
    this._steps = [];
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

  }, {
    key: "next",
    value: function next() {
      var currentFnResponse = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var logger = arguments.length > 1 ? arguments[1] : undefined;

      if (!logger) {
        logger = awsLog.logger();
        logger.getContext();
      }

      if (this.isDone) {
        logger.info("The next() function called on ".concat(this.activeFn && this.activeFn.arn ? this.activeFn.arn : "unknown", " was called but we are now done with the sequence so exiting."));
        return;
      }
      /**
       * if there is an active function, set it to completed
       * and assign _results_
       */


      if (this.activeFn) {
        var results = currentFnResponse;
        delete results._sequence;
        this._responses[this.activeFn.arn] = results;
        this.activeFn.status = "completed";
      }
      /**
       *assign the first
       */


      var body = this.resolveRequestProperties(this.nextFn);
      console.log(this.activeFn);
      var sequence = this.toObject();
      var headers = getRequestHeaders();
      logger.debug("LambdaSequence.next(): the \"".concat(this.activeFn ? "\"".concat(this.activeFn.arn, "\" function") : "sequence Conductor", "\" will be calling \"").concat(this.nextFn.arn, "\" in a moment"), {
        fn: this.nextFn.arn,
        request: {
          type: "orchestrated-message-body",
          body: body,
          sequence: sequence,
          headers: headers
        }
      }); // compress if large

      body = compress(body, 4096);
      sequence = compress(sequence, 4096);
      headers = compress(headers, 4096);
      /**
       * The parameters needed to pass into `aws-log`'s
       * invoke() function
       */

      var invokeParams = [// the arn
      this.nextFn.arn, // the params passed forward
      {
        type: "orchestrated-message-body",
        sequence: sequence,
        body: body,
        headers: headers
      }];
      this.nextFn.status = "active";
      return invokeParams;
    }
    /**
     * **from**
     *
     * unboxes `request`, `sequence`, `apiGateway`, and `headers` data structures
     */

  }, {
    key: "from",
    value: function from(event, logger) {
      var apiGateway;
      var headers = {};
      var sequence;
      var request;

      if (!logger) {
        logger = awsLog.logger();
        logger.getContext();
      }

      if (commonTypes.isLambdaProxyRequest(event)) {
        apiGateway = Object.assign({}, event);
        headers = apiGateway.headers;
        delete apiGateway.headers;
        request = commonTypes.getBodyFromPossibleLambdaProxyRequest(event);
        sequence = LambdaSequence.notASequence();
        delete apiGateway.body;
      } else if (isOrchestratedRequest(event)) {
        headers = decompress(event.headers);
        request = decompress(event.body);
        sequence = LambdaSequence.deserialize(decompress(event.sequence));
      } else if (isBareRequest(event)) {
        headers = {};
        sequence = _typeof(event) === "object" && event._sequence ? this.ingestSteps(event, event._sequence) : LambdaSequence.notASequence();
        request = _typeof(event) === "object" && event._sequence ? Object.keys(event).reduce(function (props, prop) {
          if (prop !== "_sequence") {
            props[prop] = event[prop];
          }

          return props;
        }, {}) : event;
        var e = new Error();
        logger.warn("Deprecated message format. Bare messages -- where the property \"_sequence\" is used to convey sequence passing -- has been replaced with the IOrchestratedRequest message body. This technique will be removed in the future.", {
          stack: e.stack
        });
      } // The active function's output is sent into the params


      var activeFn = this.activeFn && this.activeFn.params ? this.activeFn.params : {};
      request = Object.assign(Object.assign({}, activeFn), request);
      return {
        request: request,
        apiGateway: apiGateway,
        sequence: sequence,
        headers: headers
      };
    }
    /**
     * boolean flag which indicates whether the current execution of the function
     * is part of a _sequence_.
     */

  }, {
    key: "ingestSteps",

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
    value: function ingestSteps(request, steps) {
      var _this = this;

      if (typeof steps === "string") {
        steps = JSON.parse(steps);
      }

      if (this._steps.length > 0) {
        throw new Error("Attempt to ingest steps into a LambdaSequence that already has steps!");
      }

      this._steps = steps;
      var activeFnParams = this.activeFn && this.activeFn.params ? this.activeFn.params : {};
      var transformedRequest = _typeof(request) === "object" ? Object.assign(Object.assign({}, activeFnParams), request) : Object.assign(Object.assign({}, activeFnParams), {
        request: request
      });
      /**
       * Inject the prior function's request params into
       * active functions params (set in the conductor)
       */

      this._steps = this._steps.map(function (s) {
        return _this.activeFn && s.arn === _this.activeFn.arn ? Object.assign(Object.assign({}, s), {
          params: transformedRequest
        }) : s;
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

  }, {
    key: "deserialize",

    /**
     * Takes a serialized state of a sequence and returns
     * a `LambdaSequence` which represents this state.
     */
    value: function deserialize(s) {
      if (!s.isSequence) {
        return LambdaSequence.notASequence();
      }

      this._steps = s.steps;
      this._responses = s.responses;
      return this;
    }
  }, {
    key: "toString",
    value: function toString() {
      return JSON.stringify(this.toObject(), null, 2);
    }
  }, {
    key: "toObject",
    value: function toObject() {
      var obj = {
        isSequence: this.isSequence
      };

      if (obj.isSequence) {
        obj.totalSteps = this.steps.length;
        obj.completedSteps = this.completed.length;

        if (this.activeFn) {
          obj.activeFn = this.activeFn.arn;
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

        obj.steps = this._steps;
        obj.responses = this._responses || {};
      }

      return obj;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.toObject();
    }
    /**
     * Determine the request data to pass to the handler function:
     *
     * - Resolve _dynamic_ properties added by Conductor into static values
     * - Add _static_ properties passed in from Conductor
     *
     */

  }, {
    key: "resolveRequestProperties",
    value: function resolveRequestProperties(fn) {
      var _this2 = this;

      return Object.keys(fn.params).reduce(function (props, key) {
        var value = fn.params[key];

        if (isDynamic(value)) {
          value = get(_this2._responses, value.lookup, undefined);

          if (_typeof(value) === undefined) {
            throw new Error("The property \"".concat(key, "\" was set as a dynamic property by the Orchestrator but it was dependant on getting a value from ").concat(fn.params[key], " which could not be found."));
          }
        }

        var valueNow = function valueNow(key, value) {
          return value;
        };

        props[key] = valueNow(key, value);
        return props;
      }, {});
    }
  }, {
    key: "isSequence",
    get: function get() {
      // return this._isASequence;
      return this._steps && this._steps.length > 0;
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
      return this._steps ? this._steps.filter(function (s) {
        return s.status === "assigned";
      }) : [];
    }
    /** the tasks which have been completed */

  }, {
    key: "completed",
    get: function get() {
      return this._steps ? this._steps.filter(function (s) {
        return s.status === "completed";
      }) : [];
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
      var log = awsLog.logger().reloadContext();
      var active = this._steps ? this._steps.filter(function (s) {
        return s.status === "active";
      }) : [];

      if (active.length > 1) {
        log.warn("There appears to be more than 1 STEP in the sequence marked as active!", {
          steps: this._steps
        });
      }

      return active.length > 0 ? active[0] : undefined;
    }
  }, {
    key: "dynamicProperties",
    get: function get() {
      var _this3 = this;

      return Object.keys(this.activeFn ? this.activeFn.params : {}).reduce(function (prev, key) {
        var currentValue = _this3.activeFn.params[key];
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

  }, {
    key: "from",
    value: function from(event, logger) {
      var obj = new LambdaSequence();
      return obj.from(event, logger);
    }
    /**
     * Takes a serialized sequence and brings it back to a `LambdaSequence` class.
     */

  }, {
    key: "deserialize",
    value: function deserialize(s) {
      var obj = new LambdaSequence();
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

  }, {
    key: "notASequence",
    value: function notASequence() {
      var obj = new LambdaSequence();
      obj._steps = [];
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
      var request = commonTypes.isLambdaProxyRequest(event) ? JSON.parse(event.body) : event;

      if (commonTypes.isLambdaProxyRequest(event)) {
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
    /**
     * States how to deal with the default error handling. Default
     * error handling is used once all "known errors" have been exhausted.
     */

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

      return {
        type: "default",
        code: this.defaultErrorCode,
        prop: "_default"
      };
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

var invokeNewSequence = _async$1(function () {
  var results = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!newSequence) {
    return;
  }

  results = results || {};
  return awsLog.invoke.apply(void 0, _toConsumableArray(newSequence.next(_typeof(results) === "object" ? results : {
    data: results
  })));
});
var newSequence = LambdaSequence.notASequence();
/**
 * Adds a new sequence to be invoked later (as a call to `invokeNewSequence`)
 */

function registerSequence(log, context) {
  return function (s) {
    log.debug("This function has registered a new sequence with ".concat(s.steps.length, " steps to be kicked off as part of this function's execution."), {
      sequence: s.toObject()
    });
    newSequence = s;
  };
}
/**
 * returns the sequence which was set by `startSequence()`
 **/

function getNewSequence() {
  return newSequence;
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

var database = _async$2(function (config) {
  var log = awsLog.logger().reloadContext();
  return _invoke(function () {
    if (!_database) {
      return _invoke(function () {
        if (!config) {
          return function () {
            if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_DATA_ROOT_URL) {
              log.debug("The environment variables are in place to configure database connectivity", {
                firebaseDataRootUrl: process.env.FIREBASE_DATA_ROOT_URL
              });
            } else {
              return _await$1(getSecrets(["firebase"]), function (_ref) {
                var firebase = _ref.firebase;

                if (!firebase) {
                  throw new Error("The module \"firebase\" was not found in SSM; Firebase configuration could not be established");
                }

                if (!firebase.SERVICE_ACCOUNT) {
                  throw new Error("The module \"firebase\" was found but it did not have a ");
                }

                log.debug("The Firebase service account has been retrieved from SSM and will be used.");
                config = {
                  serviceAccount: firebase.SERVICE_ACCOUNT,
                  databaseUrl: firebase.DATABASE_URL
                };
              });
            }
          }();
        }
      }, function (_result2) {
        return  _await$1(new Promise(function (resolve) { resolve(_interopNamespace(require('abstracted-admin'))); }), function (_temp) {
          var DB = _temp.DB;
          return _await$1(DB.connect(config), function (_DB$connect) {
            _database = _DB$connect;
          });
        });
      });
    }
  }, function (_result3) {
    return  _database;
  });
});

/**
 * A collection of log messages that the wrapper function will emit
 */

var loggedMessages = function loggedMessages(log) {
  return {
    /** a handler function just started executing */
    start: function start(request, headers, context, sequence, apiGateway) {
      log.info("The handler function ".concat(context.functionName, " has started.  ").concat(sequence.isSequence ? " [ ".concat(log.getCorrelationId(), " ].") : " [ not part of sequence ]."), {
        request: request,
        sequence: sequence.toObject(),
        headers: headers,
        apiGateway: apiGateway
      });
    },
    sequenceStarting: function sequenceStarting() {
      var s = getNewSequence();
      log.debug("The NEW sequence this function/conductor registered is about to be invoked", {
        sequence: s.toObject(),
        headersForwarded: Object.keys(getRequestHeaders())
      });
    },
    sequenceStarted: function sequenceStarted(seqResponse) {
      log.debug("The NEW sequence this function registered was successfully invoked", {
        seqResponse: seqResponse
      });
    },

    /**
     * right before forwarding the sequence status to the `sequenceTracker` lambda
     */
    sequenceTracker: function sequenceTracker(_sequenceTracker, workflowStatus) {
      log.info("About to send the LambdaSequence's status to the sequenceTracker [ ".concat(_sequenceTracker, " ]"), {
        sequenceTracker: _sequenceTracker,
        workflowStatus: workflowStatus
      });
    },
    returnToApiGateway: function returnToApiGateway(result, responseHeaders) {
      log.debug("Returning results to API Gateway", {
        statusCode: commonTypes.HttpStatusCodes.Success,
        result: JSON.stringify(result),
        responseHeaders: responseHeaders
      });
    },

    /**
     * as soon as an error is detected in the wrapper, write a log message about the error
     */
    processingError: function processingError(e, workflowStatus) {
      var stack = e.stack || new Error().stack;
      log.info("Processing error in handler function; error occurred sometime after the \"".concat(workflowStatus, "\" workflow status: [ ").concat(e.message, " ]"), {
        errorMessage: e.message,
        stack: stack,
        workflowStatus: workflowStatus
      });
    }
  };
};

/**
 * converts an `Error` (or subclass) into a error hash
 * which **API Gateway** can process.
 */

function convertToApiGatewayError(e) {
  var defaultCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_ERROR_CODE;
  return {
    headers: getResponseHeaders(),
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
 * @param req a strongly typed request object that is defined by the `<I>` generic
 * @param context the contextual props and functions which AWS provides plus additional
 * features brought in by the wrapper function
 */

function _await$2(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

function _empty() {}

function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}

function _invokeIgnored(body) {
  var result = body();

  if (result && result.then) {
    return result.then(_empty);
  }
}

function _invoke$1(body, then) {
  var result = body();

  if (result && result.then) {
    return result.then(then);
  }

  return then(result);
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
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  /** this is the core Lambda event which the wrapper takes as an input */
  return _async$3(function (event, context) {
    var result;
    var workflowStatus;
    workflowStatus = "initializing";
    context.callbackWaitsForEmptyEventLoop = false;
    var log = awsLog.logger().lambda(event, context);
    var msg = loggedMessages(log);
    var errorMeta = new ErrorMeta();
    return _catch(function () {
      workflowStatus = "starting-try-catch";

      var _LambdaSequence$from = LambdaSequence.from(event),
          request = _LambdaSequence$from.request,
          sequence = _LambdaSequence$from.sequence,
          apiGateway = _LambdaSequence$from.apiGateway,
          headers = _LambdaSequence$from.headers;

      msg.start(request, headers, context, sequence, apiGateway);
      saveSecretHeaders(headers, log);
      maskLoggingForSecrets(getLocalSecrets(), log); //#region PREP

      workflowStatus = "prep-starting";
      var status = sequenceStatus(log.getCorrelationId());
      var registerSequence$1 = registerSequence(log, context);
      var handlerContext = Object.assign(Object.assign({}, context), {
        log: log,
        headers: headers,
        setHeaders: setFnHeaders,
        setContentType: setContentType,
        database: database,
        sequence: sequence,
        registerSequence: registerSequence$1,
        isSequence: sequence.isSequence,
        isDone: sequence.isDone,
        apiGateway: apiGateway,
        getSecret: getSecret,
        getSecrets: getSecrets,
        isApiGatewayRequest: commonTypes.isLambdaProxyRequest(event),
        errorMgmt: errorMeta
      }); //#endregion
      //#region CALL the HANDLER FUNCTION

      workflowStatus = "running-function";
      return _await$2(fn(request, handlerContext), function (_fn) {
        result = _fn;
        log.debug("handler function returned to wrapper function", {
          result: result
        });
        workflowStatus = "function-complete"; //#endregion
        //region SEQUENCE (next)

        return _invoke$1(function () {
          if (sequence.isSequence && !sequence.isDone) {
            workflowStatus = "invoke-started";
            return _await$2(awsLog.invoke.apply(void 0, _toConsumableArray(sequence.next(result))), function (invokeParams) {
              log.debug("finished invoking the next function in the sequence", {
                invokeParams: invokeParams
              });
              workflowStatus = "invoke-complete";
            });
          }
        }, function () {
          //#endregion
          //#region SEQUENCE (orchestration starting)
          return _invoke$1(function () {
            if (getNewSequence().isSequence) {
              workflowStatus = "sequence-starting";
              msg.sequenceStarting();
              return _await$2(invokeNewSequence(result, log), function (seqResponse) {
                msg.sequenceStarted(seqResponse);
                workflowStatus = "sequence-started";
              });
            } else {
              log.debug("This function did not kick off a NEW sequence.");
            }
          }, function () {
            //#endregion
            //#region SEQUENCE (send to tracker)
            return _invoke$1(function () {
              if (options.sequenceTracker && sequence.isSequence) {
                workflowStatus = "sequence-tracker-starting";
                msg.sequenceTracker(options.sequenceTracker, workflowStatus);
                return _invokeIgnored(function () {
                  if (sequence.isDone) {
                    return _awaitIgnored(awsLog.invoke(options.sequenceTracker, status(sequence), result));
                  } else {
                    return _awaitIgnored(awsLog.invoke(options.sequenceTracker, status(sequence)));
                  }
                });
              }
            }, function () {
              //#endregion
              //#region RETURN-VALUES
              workflowStatus = "returning-values";

              if (handlerContext.isApiGatewayRequest) {
                var response = {
                  statusCode: commonTypes.HttpStatusCodes.Success,
                  headers: getResponseHeaders(),
                  body: typeof result === "string" ? result : JSON.stringify(result)
                };
                msg.returnToApiGateway(result, getResponseHeaders());
                return response;
              } else {
                log.debug("Returning results to non-API Gateway caller", {
                  result: result
                });
                return result;
              }
            }); //#endregion
          });
        });
      });
    }, function (e) {
      msg.processingError(e, workflowStatus);
      var found = findError(e, errorMeta);
      var isApiGatewayRequest = commonTypes.isLambdaProxyRequest(event);
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
              return _await$2(awsLog.invoke(found.handling.forwardTo, e), function () {
                log.info("Forwarded error to the function \"".concat(found.handling.forwardTo, "\""), {
                  error: e,
                  forwardTo: found.handling.forwardTo
                });
              });
            }
          });
        } else {
          // UNFOUND ERROR
          log.debug("An error is being processed by the default handling mechanism", {
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
                log.debug("The error was fully handled by the handling function/callback; resulting in a successful condition [ ".concat(result ? commonTypes.HttpStatusCodes.Success : commonTypes.HttpStatusCodes.NoContent, " ]."));

                if (isApiGatewayRequest) {
                  return {
                    statusCode: result ? commonTypes.HttpStatusCodes.Success : commonTypes.HttpStatusCodes.NoContent,
                    headers: getResponseHeaders(),
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
            return _await$2(awsLog.invoke(handling.arn, e), function () {
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
            log.debug("Error handled by default policy", {
              code: errorMeta.defaultErrorCode,
              message: e.message,
              stack: e.stack
            });

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

exports.LambdaEventParser = LambdaEventParser;
exports.LambdaSequence = LambdaSequence;
exports.compress = compress;
exports.decompress = decompress;
exports.dynamic = dynamic;
exports.isBareRequest = isBareRequest;
exports.isCompressedSection = isCompressedSection;
exports.isDynamic = isDynamic;
exports.isOrchestratedRequest = isOrchestratedRequest;
exports.sequenceStatus = sequenceStatus;
exports.serializeSequence = serializeSequence;
exports.wrapper = wrapper;
