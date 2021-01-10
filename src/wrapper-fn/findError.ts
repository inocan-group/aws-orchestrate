import type { ErrorApi } from "../index";
import { IKnownError, KnownError } from "../errors";
import { isBrilliantError } from "brilliant-errors";

/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 */
export function findError(
  e: Error & { code?: string },
  expectedErrors: ErrorApi
): IKnownError | undefined {
  let found: undefined | IKnownError;

  expectedErrors.list.forEach((i) => {
    if (isBrilliantError(e) && e) {
    }

    if (
      (e?.code && e.code === i.identifiedBy.code) ||
      (e?.name && e.name == i.identifiedBy.name) ||
      (e.message && e.message.includes(i.identifiedBy.messageContains)) ||
      (i.identifiedBy.errorClass && e instanceof i.identifiedBy.errorClass)
    ) {
      found = KnownError.from(e, i.code);
    }
  });

  return found;
}
