/**
 * deserializes a Javascript object that was serialized with `serialize-javascript`
 */
export function deserialize(serializedJavascript) {
    return eval('(' + serializedJavascript + ')');
}
//# sourceMappingURL=deserialize.js.map