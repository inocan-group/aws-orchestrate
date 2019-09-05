'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
var awsLog = require('aws-log');

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

  _createClass(LambdaSequence, [{
    key: "add",
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

      if (this.activeFn) {
        var results = additionalParams;
        delete results._sequence;
        this.activeFn.results = results;
        this.activeFn.status = "completed";
      }

      this._steps = this._steps.map(function (i) {
        return i.arn === _this.nextFn.arn ? Object.assign(Object.assign({}, i), {
          params: _this.resolveDynamicProperties(_this.nextFn.params, additionalParams)
        }) : i;
      });
      var nextFunctionTuple = [this.nextFn.arn, Object.assign(Object.assign({}, this.nextFn.params), {
        _sequence: this.steps
      })];
      this.nextFn.status = "active";
      return nextFunctionTuple;
    }
  }, {
    key: "from",
    value: function from(request, logger) {
      var _this2 = this;

      var apiGateway;

      if (commonTypes.isLambdaProxyRequest(request)) {
        apiGateway = request;
        request = commonTypes.getBodyFromPossibleLambdaProxyRequest(request);
      }

      if (!request._sequence) {
        if (logger) {
          logger.info("This execution is not part of a sequence");
        }

        return {
          request: request,
          apiGateway: apiGateway,
          sequence: LambdaSequence.notASequence()
        };
      }

      this._steps = request._sequence;
      var transformedRequest = Object.assign(Object.assign({}, request), this.activeFn.params);
      delete transformedRequest._sequence;
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
  }, {
    key: "remaining",
    get: function get() {
      return this._steps.filter(function (s) {
        return s.status === "assigned";
      });
    }
  }, {
    key: "completed",
    get: function get() {
      return this._steps.filter(function (s) {
        return s.status === "completed";
      });
    }
  }, {
    key: "length",
    get: function get() {
      return this._steps.length;
    }
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

var LambdaEventParser =
/*#__PURE__*/
function () {
  function LambdaEventParser() {
    _classCallCheck(this, LambdaEventParser);
  }

  _createClass(LambdaEventParser, null, [{
    key: "parse",
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
var ErrorMeta =
/*#__PURE__*/
function () {
  function ErrorMeta() {
    _classCallCheck(this, ErrorMeta);

    this._errors = [];
    this._defaultErrorCode = DEFAULT_ERROR_CODE;
  }

  _createClass(ErrorMeta, [{
    key: "add",
    value: function add(code, identifiedBy, handling) {
      this._errors.push(new ErrorHandler(code, identifiedBy, handling));
    }
  }, {
    key: "setDefaultErrorCode",
    value: function setDefaultErrorCode(code) {
      this._defaultErrorCode = code;
      return this;
    }
  }, {
    key: "setDefaultHandlerFunction",
    value: function setDefaultHandlerFunction(arn) {
      this._arn = arn;
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
  }, {
    key: "lambdaError",
    value: function lambdaError(errorCode, e, classification) {
      var obj = new UnhandledError(errorCode, e, classification);
    }
  }]);

  return UnhandledError;
}(_wrapNativeSuper(Error));

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
  }, {
    key: "lambdaError",
    value: function lambdaError(errorCode, e, context) {
      var obj = new HandledError(errorCode, e, context);
    }
  }]);

  return HandledError;
}(_wrapNativeSuper(Error));

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

    return _await(new Promise(function (resolve) { resolve(_interopNamespace(require('aws-ssm'))); }), function (_temp) {
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
      return _await$1(new Promise(function (resolve) { resolve(_interopNamespace(require('abstracted-admin'))); }), function (_temp) {
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

var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};
var contentType = "application/json";
var fnHeaders = {};
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
function setHeaders(headers) {
  if (_typeof(headers) !== "object") {
    throw new Error("The value sent to setHeaders is not the required type. Was \"".concat(_typeof(headers), "\"; expected \"object\"."));
  }

  fnHeaders = headers;
}

function _await$2(value, then, direct) {
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

var wrapper = function wrapper(fn) {
  return _async$2(function (event, context) {
    var workflowStatus = "initializing";
    var log = awsLog.logger().lambda(event, context);
    var errorMeta = new ErrorMeta();
    return _catch(function () {
      context.callbackWaitsForEmptyEventLoop = false;

      var _LambdaSequence$from = LambdaSequence.from(event),
          request = _LambdaSequence$from.request,
          sequence = _LambdaSequence$from.sequence,
          apiGateway = _LambdaSequence$from.apiGateway;

      log.info("The handler function \"".concat(context.functionName, "\" has started execution.  ").concat(sequence.isSequence ? "This handler is part of a sequence [".concat(log.getCorrelationId(), " ].") : "This handler was not triggered as part of a sequence."), {
        clientContext: context.clientContext,
        request: request,
        sequence: sequence,
        apiGateway: apiGateway
      });
      var handlerContext = Object.assign(Object.assign({}, context), {
        log: log,
        setHeaders: setHeaders,
        setContentType: setContentType,
        database: database,
        sequence: sequence,
        isSequence: sequence.isSequence,
        isDone: sequence.isDone,
        apiGateway: apiGateway,
        getSecrets: getSecrets(request),
        isApiGatewayRequest: apiGateway && apiGateway.headers ? true : false,
        errorMeta: errorMeta
      });
      workflowStatus = "running-function";
      return _await$2(fn(request, handlerContext), function (results) {
        workflowStatus = "function-complete";
        return _invoke$1(function () {
          if (sequence.isSequence && !sequence.isDone) {
            workflowStatus = "invoke-started";
            return _await$2(awsLog.invoke.apply(void 0, _toConsumableArray(sequence.next(results))), function () {
              workflowStatus = "invoke-complete";
            });
          }
        }, function () {
          return _invoke$1(function () {
            if (results instanceof LambdaSequence || _typeof(results) === "object" && (results.sequence instanceof LambdaSequence || results._sequence instanceof LambdaSequence)) {
              workflowStatus = "sequence-defined";

              var _sequence = results instanceof LambdaSequence ? results : results._sequence || results.sequence;

              var location = results instanceof LambdaSequence ? "root" : results._sequence ? "_sequence" : "sequence";
              log.info("This function has started a sequence [ prop: ".concat(location, " ]! There are ").concat(_sequence.steps.length, " steps in this sequence."), {
                sequence: _sequence
              });

              if (location === "_sequence") {
                delete results._sequence;
              } else if (location === "sequence") {
                delete results.sequence;
              }

              return _await$2(awsLog.invoke.apply(void 0, _toConsumableArray(_sequence.next(location === "root" ? undefined : results))), function () {
                workflowStatus = "sequence-started";
              });
            }
          }, function () {
            if (handlerContext.isApiGatewayRequest) {
              var headers = Object.assign(Object.assign(Object.assign({}, CORS_HEADERS), getHeaders()), {
                "Content-Type": getContentType()
              });
              var response = {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify(results)
              };
              log.debug("Returning results to API Gateway", {
                statusCode: 200,
                results: results
              });
              return response;
            } else {
              log.debug("Returning results to non-API Gateway caller", {
                results: results
              });
              return results;
            }
          });
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
                return HandledError.apiGatewayError(found.code, e, log.getContext());
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
          log.warn("The error in \"".concat(context.functionName, "\" has been returned to API Gateway using the default handler"), {
            error: e,
            workflowStatus: workflowStatus
          });

          if (isApiGatewayRequest) {
            throw UnhandledError.apiGatewayError(errorMeta.defaultErrorCode, e, context.awsRequestId);
          } else {
            throw new UnhandledError(errorMeta.defaultErrorCode, e, context.awsRequestId);
          }
        }
      }();
    });
  });
};

exports.LambdaEventParser = LambdaEventParser;
exports.LambdaSequence = LambdaSequence;
exports.wrapper = wrapper;
