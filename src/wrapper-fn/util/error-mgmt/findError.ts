import { ErrorMeta, ErrorHandler } from "~/wrapper-fn/util";
/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 * If _not_ found then return `false`.
 */
export function findError<I, O>(
  e: Error & { code?: string },
  expectedErrors: ErrorMeta<I, O>
): false | ErrorHandler<I, O> {
  let found: false | ErrorHandler<I, O> = false;
  for (const idx of expectedErrors.list) {
    const messageContains = idx.identifiedBy.messageContains;
    if (
      (e.code && e.code === idx.identifiedBy.code) ||
      (e.name && e.name === idx.identifiedBy.name) ||
      (e.message && messageContains && e.message.includes(messageContains)) ||
      (idx.identifiedBy.errorClass && e instanceof idx.identifiedBy.errorClass)
    ) {
      found = idx;
    }
  }

  return found;
}
