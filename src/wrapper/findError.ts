import { ErrorHandler } from "../ErrorHandler";
import { ErrorMeta } from "../ErrorMeta";
/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 * If _not_ found then return `false`.
 */
export function findError(
  e: Error & { code?: string },
  expectedErrors: ErrorMeta
): false | ErrorHandler {
  let found: false | ErrorHandler = false;
  expectedErrors.list.forEach(i => {
    if (
      e.code === i.identifiedBy.code ||
      e.name == i.identifiedBy.name ||
      e.message.includes(i.identifiedBy.messageContains) ||
      e instanceof i.identifiedBy.errorClass
    ) {
      found = i;
    }
  });

  return found;
}
