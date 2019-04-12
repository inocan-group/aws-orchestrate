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
        type: type
      });

      return this;
    }
  }, {
    key: "next",
    value: function next() {
      var additionalParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var nextFn = this._steps[0];
      return [nextFn.arn, Object.assign({}, nextFn.params, additionalParams)];
    }
  }, {
    key: "from",
    value: function from(request) {
      var apiGateway;

      if (commonTypes.isLambdaProxyRequest(request)) {
        apiGateway = request;
        request = commonTypes.getBodyFromPossibleLambdaProxyRequest(request);
      }

      if (!request.sequence) {
        return {
          request: request,
          apiGateway: apiGateway,
          sequence: LambdaSequence.notASequence()
        };
      }

      var currentStep = request.sequence.shift();
      this._steps = request.sequence;
      var transformedRequest = Object.assign({}, request, currentStep.params);
      delete transformedRequest.sequence;
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
      return this.length === 0;
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

exports.LambdaSequence = LambdaSequence;
