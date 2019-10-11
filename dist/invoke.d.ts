import { IOrchestratedRequest } from "./@types";
/**
 * Wraps the functionality provided by the `aws-log`'s **invoke()** function
 * that ensures that improper self-calling is prohibited unless expressly enabled
 *
 * @param fnArn the Function's ARN
 * @param request The request object to pass to the next function
 */
export declare function invoke<T>(fnArn: string, request: IOrchestratedRequest<T>): Promise<import("aws-sdk/clients/lambda").InvocationResponse>;
