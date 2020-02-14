import { IErrorIdentification, IErrorHandling } from "./@types";
/**
 * Allows the definition of a serverless function's
 * expected error code
 */
export declare class ErrorHandler {
    code: number;
    identifiedBy: IErrorIdentification;
    handling: IErrorHandling;
    constructor(code: number, identifiedBy: IErrorIdentification, handling: IErrorHandling);
    toString(): {
        code: number;
        identifiedBy: IErrorIdentification;
        handling: IErrorHandling;
    };
}
