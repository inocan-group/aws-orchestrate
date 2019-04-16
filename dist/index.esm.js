import { createError, isLambdaProxyRequest, getBodyFromPossibleLambdaProxyRequest } from 'common-types';

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
      var additionalParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this.isDone()) {
        throw createError("aws-orchestration/sequence-done", "Attempt to call next() on a sequence which is already completed. Always check sequence's state with isDone() before running next().");
      }

      console.log(this.nextFn.arn);
      var tuple = [this.nextFn.arn, Object.assign({}, this.nextFn.params, additionalParams, {
        _sequence: this.steps
      })];
      console.log(this.nextFn.arn);

      if (this.activeFn) {
        var results = Object.assign({}, tuple[1]);
        delete results._sequence;
        this.activeFn.results = results;
        this.activeFn.status = "completed";
      }

      this.nextFn.status = "active";
      this.dynamicProperties.map(function (p) {
        tuple[1][p.key] = tuple[1][p.from];
      });
      console.log(tuple[1]._sequence);
      return tuple;
    }
  }, {
    key: "from",
    value: function from(request) {
      var apiGateway;

      if (isLambdaProxyRequest(request)) {
        apiGateway = request;
        request = getBodyFromPossibleLambdaProxyRequest(request);
      }

      if (!request._sequence) {
        return {
          request: request,
          apiGateway: apiGateway,
          sequence: LambdaSequence.notASequence()
        };
      }

      this._steps = request._sequence;
      var transformedRequest = Object.assign({}, request, this.activeFn.params);
      delete transformedRequest._sequence;
      return {
        request: transformedRequest,
        apiGateway: apiGateway,
        sequence: this
      };
    }
  }, {
    key: "isSequence",
    value: function isSequence() {
      return this._isASequence;
    }
  }, {
    key: "isDone",
    value: function isDone() {
      return this.remaining.length === 0;
    }
  }, {
    key: "toString",
    value: function toString() {
      var obj = {
        isASequence: this._isASequence
      };

      if (this._isASequence) {
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

        obj.results = this.completed.reduce(function (acc, curr) {
          acc[curr.arn] = curr.results;
          return acc;
        }, {});
      }
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
    key: "dynamicProperties",
    get: function get() {
      var _this = this;

      return Object.keys(this.activeFn.params).reduce(function (prev, key) {
        var currentValue = _this.activeFn.params[key];
        console.log(currentValue);
        var valueIsDynamic = String(currentValue).slice(0, 1) === ":";
        console.log(valueIsDynamic);
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
    value: function from(event) {
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

export { LambdaSequence };
