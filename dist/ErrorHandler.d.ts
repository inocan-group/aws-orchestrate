import { IErrorIdentification, IErrorHandling } from "./@types";
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
