"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * deserializes a Javascript object that was serialized with `serialize-javascript`
 */
function deserialize(serializedJavascript) {
    return eval('(' + serializedJavascript + ')');
}
exports.deserialize = deserialize;
//# sourceMappingURL=deserialize.js.map