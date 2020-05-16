"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoke = void 0;
const aws_log_1 = require("aws-log");
const private_1 = require("../private");
/**
 * A higher-order function which accepts a _sequence_ as an input first.
 * In essence, this just provides useful configuration which the _wrapper
 * function_ can provide and then it passes the remaining function down
 * to the consumer of this library to use in the handler function (aka, as
 * part of the `context` object passed into the handler).
 *
 * Calling the first function returns a _invocation_ function which just
 * takes the ARN and request params (optionally allowing additional
 * _headers_ too).
 */
function invoke(sequence) {
    return (fnArn, request, additionalHeaders) => {
        const boxedRequest = private_1.buildOrchestratedRequest(request, sequence, additionalHeaders);
        return aws_log_1.invoke(fnArn, boxedRequest);
    };
}
exports.invoke = invoke;
//# sourceMappingURL=invoke.js.map