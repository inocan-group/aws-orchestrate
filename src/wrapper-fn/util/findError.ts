import { ErrorMeta, ErrorHandler } from "~/errors";
/**
 * **findError**
 *
 * Look for the error encountered within the "known errors" that
 * the function defined and return it's `ErrorHandler` if found.
 * If _not_ found then return `false`.
 */
export function findError(e: Error & { code?: string }, expectedErrors: ErrorMeta): false | ErrorHandler {
  let found: false | ErrorHandler = false;
  for (const index of expectedErrors.list) {
    if (
      (e.code && e.code === index.identifiedBy.code)
      || (e.name && e.name === index.identifiedBy.name)
      || (e.message && e.message.includes(index.identifiedBy.messageContains))
      || (index.identifiedBy.errorClass && e instanceof index.identifiedBy.errorClass)
    ) {found = index;}
  }

  return found;
}
