import type { ErrorApi, ErrorHandler } from "../index";
/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 */
export function findError(
  e: Error & { code?: string },
  expectedErrors: ErrorApi
): ErrorHandler | undefined {
  let found: undefined | ErrorHandler;
  expectedErrors.list.forEach((i) => {
    if (
      (e.code && e.code === i.identifiedBy.code) ||
      (e.name && e.name == i.identifiedBy.name) ||
      (e.message && e.message.includes(i.identifiedBy.messageContains)) ||
      (i.identifiedBy.errorClass && e instanceof i.identifiedBy.errorClass)
    ) {
      found = i;
    }
  });

  return found;
}
