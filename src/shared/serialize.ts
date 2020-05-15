import { IDictionary } from "common-types";
import { encrypt } from "./encrypt";

/**
 * **serialize**
 *
 * Serializes a function as a string so that it may be passed on to other serverless function
 *
 * @param fn The function to be serialized
 * @param ctx The context object known at build time which will be made available to the function
 */
export function serialize(
  /**
   * A function which takes:
   *
   * - `ctx` is a dictionary of name/values known at build time
   * - `last` is the output from the previous function in the sequence
   * - `previous` a hash of values returned from each step in the sequence
   */
  fn: (ctx: IDictionary, last?: IDictionary, previous?: IDictionary) => void,
  ctx: IDictionary = {}
) {
  const prolog = `return () => {\nconst ctx = ${JSON.stringify(ctx)};\n\treturn () => `;
  const epilog = `;`;
  const jsonString = encrypt(`${prolog} ${fn.toString().replace(/$function /, "")} ${epilog}`);
  // TODO: implement
}
