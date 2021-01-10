import { IErrorIdentification, IErrorHandling } from "../@types";

/**
 * Allows the definition of a serverless function's
 * expected error code
 */
export class ErrorHandler {
  constructor(public code: number, public identifiedBy: IErrorIdentification, public handling: IErrorHandling) {}

  toString() {
    return {
      code: this.code,
      identifiedBy: this.identifiedBy,
      handling: this.handling,
    };
  }
}
