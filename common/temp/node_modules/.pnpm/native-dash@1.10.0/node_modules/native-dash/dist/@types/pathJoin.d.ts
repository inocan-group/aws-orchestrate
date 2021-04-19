/**
 * Joins a set of paths together into a single path.
 *
 * **Note:** trailing path never includes a `/` so add this at the end if
 * you need it.
 *
 * **Note:** the ".." characters are allowed in starting string but in no
 * other.
 *
 * **Note:** any use of the Windows "\\" will be converted to the Posix "/"
 */
export declare function pathJoin(...args: string[]): string;
