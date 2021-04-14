import { IErrorIdentification, IErrorHandling } from "~/types";

/**
 * Allows the definition of a serverless function's
 * expected error code
 */
export class ErrorHandler<I, O> {
  constructor(public code: number, public identifiedBy: IErrorIdentification, public handling: IErrorHandling<I, O>) {}

  toString() {
    return {
      code: this.code,
      identifiedBy: this.identifiedBy,
      handling: this.handling,
    };
  }
}
