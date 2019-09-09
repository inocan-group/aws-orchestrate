import { IDictionary } from "common-types";
import { ILoggerApi } from "aws-log";
/**
 * Saves secrets locally so they can be used rather than
 * going out to SSM. These secrets will then also be "passed
 * forward" to any functions which are invoked.
 */
export declare function saveSecretsLocally(secrets: IDictionary): void;
/**
 * Adds a new secret to the existing cache of secrets.
 */
export declare function addSecretToLocalCache(name: string, value: any): void;
/**
 * Gets the locally stored secrets. The format of the keys in this hash
 * should be `module/SECRET` which cooresponds to the `aws-ssm` opinion
 * on SSM naming.
 */
export declare function getLocalSecrets(): IDictionary<any>;
/**
 * **getSecrets**
 *
 * Gets the needed secrets for this function -- using locally available information
 * if available (_params_ and/or _cached_ values from prior calls) -- otherwise
 * goes out **SSM** to get it.
 *
 * In addition, all secrets requested (within the given function as well as
 * _prior_ function's secrets in a sequence) will be auto-forwarded to subsequent
 * functions in the currently executing sequence. Secrets _will not_ be passed back
 * in the function's response.
 *
 * @param modules the modules which are have secrets that are needed0
 */
export declare function getSecrets(modules: string[]): Promise<IDictionary<IDictionary>>;
/**
 * Goes through a set of secrets -- organized by `[module].[name] = secret` --
 * and masks the values so that they don't leak into the log files.
 */
export declare function maskLoggingForSecrets(modules: IDictionary, log: ILoggerApi): void;
