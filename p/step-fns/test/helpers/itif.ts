export type BooleanFn = () => boolean;

/**
 * Conditionally run a Jest test; _skip_ if condition is not met
 */
export const itif = (condition: boolean | BooleanFn) => {
  if (typeof condition === "boolean") {
    return condition ? it : it.skip;
  }

  return condition() ? it : it.skip;
};
