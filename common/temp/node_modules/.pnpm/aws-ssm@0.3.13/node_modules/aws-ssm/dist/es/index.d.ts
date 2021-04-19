import { SSM as AwsSSM } from "aws-sdk";
import { CredentialsOptions } from "aws-sdk/lib/credentials";
import { ISsmRemoveOptions, ISsmListOptions, ISsmGetOptions, ISsmPutOptions, SsmValue, ISsmConfig, SsmValueType, ISsmGetResult, ISsmParameter, ISsmPathParts, ISsmModuleOptions, ISsmExportsOutput } from "./types";
export declare type GetParametersByPathRequest = import("aws-sdk").SSM.GetParametersByPathRequest;
export * from "./parseForNameComponents";
export * from "./types";
export declare class SSM {
    private _credentials?;
    private _ssm;
    private _cli;
    private _region;
    private _defaultType;
    constructor(config?: ISsmConfig);
    /**
     * Instantiates SSM using the default configuration and calls the `module` instance method.
     */
    static modules(mods: string | string[], options?: ISsmModuleOptions & {
        config?: ISsmConfig;
    }): Promise<ISsmExportsOutput>;
    get configuration(): {
        credentials: CredentialsOptions;
        cli: boolean;
        region: string;
        defaultType: SsmValueType;
    };
    get(Name: string, options?: ISsmGetOptions): Promise<ISsmGetResult>;
    convertToEnv(Name: string, options?: ISsmGetOptions): Promise<void>;
    /**
     * put
     *
     * Puts a value into SSM and then returns the version number
     * on success.
     *
     * @param Name The name/path of the variable
     * @param Value The value to set to
     * @param options Any additional options needed
     */
    put(Name: string, Value: SsmValue, options?: ISsmPutOptions): Promise<number>;
    /**
     * list
     *
     * Lists the SSM Parameters available. If you wish to have a scoped/subset of parameters
     * you should use optional "options" parameter. When you pass in a "string" this is
     * the same as setting the "path" option but does remove your ability to set other options.
     *
     * @param pathOrOptions the hierarchical path position to start the recursive
     * search for parameters, OR a configuration object
     */
    list(pathOrOptions?: string | ISsmListOptions): Promise<ISsmParameter[]>;
    /**
     * Produces a list of SSM parameters; this is very similar to the `list()` method
     * but the data that is returned includes the last person/user to touch the value
     * and _does not_ include the value of the secret.
     */
    describeParameters(options?: {
        MaxResults?: number;
        NextToken?: string;
    }): Promise<AwsSSM.ParameterMetadataList>;
    /**
     * values
     *
     * An "alias" to the list() function except that values are decrypted
     *
     * @param path the hierarchical path position to start the recursive
     * search for parameters
     */
    values(path?: string): Promise<ISsmParameter<string>[]>;
    /**
     * modules
     *
     * returns the list of parameters in the current STAGE which are related to a given
     * module/app. You can optionally specify a specific version.
     *
     * @param mods an array of modules/apps to look for
     * @param options state the explicit app version to use or
     * @return returns a hash who's keys are the module name; each module will be a hash who's keys are the key's property name
     */
    modules(mods: string | string[], options?: ISsmModuleOptions): Promise<ISsmExportsOutput>;
    delete(Name: string, options?: ISsmRemoveOptions): Promise<void>;
}
export declare function buildPathFromNameComponents(parts: ISsmPathParts): string;
