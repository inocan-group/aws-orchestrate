import { ErrorKind } from "./index";
export declare abstract class BrilliantError<TCode extends string = string, TError extends number = number> {
    readonly kind: typeof ErrorKind;
    /**
     * The classification of the error a combination of the app's
     * name and the error code passed in.
     */
    classification: TCode;
    /**
     * A string based code to classify the error
     */
    code: TCode;
    /**
     * An HTTP Error code; this is not required for an `AppError`'s but may be provided
     * optionally.
     */
    errorCode?: number;
}
