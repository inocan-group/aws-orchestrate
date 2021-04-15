export type TestFunction<T> = (...args: any[]) => T;

export interface ILeft<T> {
  _left: T;
  _right: undefined;
}

export interface IRight<T> {
  _left: undefined;
  _right: T;
}

export type ILeftRight<E, T> = ILeft<E> | IRight<T>;

/**
 * Allows a function call which _might_ result in an error be run as a test
 * where a Left/Right response typical of some functional programming languages
 * is returned. This allows you to interogate all the error's properties
 * (versus just compare the message as Jest's `.toThrow()` assertion does).
 *
 * So, for example, if you have a function `dodgy()` that might throw an error:
 *
 * ```ts
 * import { catchErr, left, right } = './catchErr';
 * const result = catchErr(() => dodgy(1,2,3));
 * // test that there is an error
 * expect(left(result)).toBeTrue();
 * // test props of error
 * expect(left(result).stack).toBeEmpty();
 * ```
 */
export function catchErr<T extends any, E extends Error = Error>(fn: TestFunction<T>): ILeftRight<E, T> {
  try {
    return { _right: fn(), _left: undefined };
  } catch (error) {
    return { _left: error as E, _right: undefined };
  }
}

/** Pull off the Error from a `ILeftRight` result or returns false if was not an error */
export function left<E extends Error>(result: ILeft<E>) {
  return result._left;
}

/** type guard that establishes that function DID produce an error */
export function isLeft<E extends Error>(result: ILeftRight<E, unknown>): result is ILeft<E> {
  return result._right === undefined;
}

/** type guard that establishes that function _did not_ report an error */
export function isRight<T extends any>(result: ILeftRight<unknown, T>): result is IRight<T> {
  return result._left === undefined;
}

/** Pull off the Error from a `ILeftRight` result or returns false if was not an error */
export function right<T extends any>(result: IRight<T>) {
  return result._right;
}
