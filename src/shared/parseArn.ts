import { isArn } from "common-types";
import { IParsedArn } from "~/types";
import { parsePartiallyQualifiedArn, parseFullyQualifiedArn } from "./parse/index";
import { IPartialParseOptions } from "./parse/parsePartiallyQualifiedArn";

/**
 * **parseArn**
 *
 * Takes a _partial_ or _fully qualified_ **ARN** string and attempts to build the
 * all the components that constitute a fully qualified ARN (aka., `IParsedArn`).
 */
export function parseArn(arn: string, defaultValues: IPartialParseOptions): IParsedArn {
  return isArn(arn) ? parseFullyQualifiedArn(arn) : parsePartiallyQualifiedArn(arn, defaultValues);
}
