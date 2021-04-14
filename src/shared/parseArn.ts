import { IDictionary, isArn } from "common-types";
import { IParsedArn } from "~/types";
import { parsePartiallyQualifiedArn, parseFullyQualifiedArn } from "./parse/index";

/**
 * **parseArn**
 *
 * Takes a _partial_ or _fully qualified_ **ARN** string and attempts to build the
 * all the components that constitute a fully qualified ARN (aka., `IParsedArn`).
 */
export function parseArn(arn: string, lookup?: IDictionary): IParsedArn {
  return isArn(arn) ? parseFullyQualifiedArn(arn) : parsePartiallyQualifiedArn(arn, lookup);
}
