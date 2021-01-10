/**
 * deserializes a Javascript object that was serialized with `serialize-javascript`
 */
export function deserialize(serializedJavascript: string) {
  return eval("(" + serializedJavascript + ")");
}
