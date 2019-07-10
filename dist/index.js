'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var commonTypes = require('common-types');

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

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
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
        return i.arn === _this.nextFn.arn ? Object.assign({}, i, {
          params: _this.resolveDynamicProperties(_this.nextFn.params, additionalParams)
        }) : i;
      });
      var nextFunctionTuple = [this.nextFn.arn, Object.assign({}, this.nextFn.params, {
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
      var transformedRequest = Object.assign({}, request, this.activeFn.params);
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
      return Object.assign({}, Object.keys(priorFnResults).reduce(function (agg, curr) {
        return !remappedProps.includes(curr) ? Object.assign({}, agg, _defineProperty({}, curr, priorFnResults[curr])) : agg;
      }, {}), conductorParams);
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
      return obj.from(event);
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

exports.LambdaEventParser = LambdaEventParser;
exports.LambdaSequence = LambdaSequence;
