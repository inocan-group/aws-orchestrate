import { arn, IDictionary } from "common-types";
import {
  IArnStringReference,
  ICloudformationReference,
  IServerlessFunction,
  IServerlessProvider,
  IServerlessLogging,
  IServerlessPackage,
  IServerlessResources,
  IServerlessTracing,
  IStateMachine,
} from "./index";

export interface IServerlessAccountInfo {
  name: string;
  accountId: string;
  region: string;
  profile: string;
  /**
   * Add X-RAY tracing to API Gateway and Lambda. Using the boolean flags
   * you are setting both but if you only want one you can state which one
   * as the value.
   */
  tracing?: IServerlessTracing | boolean;
  /**
   * if you want to forward logs to another lambda you can state the **ARN** here
   */
  logForwarding?: arn;
  /**
   * a list of serverless plugins installed
   */
  pluginsInstalled: string[];
  /**
   * a list of all Development Dependencies
   */
  devDependencies: string[];
}

export type AWSRuntime =
  | "nodejs6.10"
  | "nodejs8.10"
  | "nodejs10.x"
  | "nodejs12.x"
  | "nodejs14.x"
  | "node4"
  | "java8"
  | "python2.7"
  | "python3.6"
  | "go1.x";

export interface IServerlessConfigCustom extends IDictionary {
  stage?: string;
  region?: string;
  accountId?: string;
  webpack?: IDictionary;
  logForwarding?: {
    /** a fully qualified ARN to the function who will act as the "shipper" */
    destinationARN: arn;
  };
}

export interface ILayerDefinition {
  [layerName: string]: {
    /**
     * This indicates the path in the layer repos file system where
     * content will be picked up. So if you're adding a layer with
     * NPM modules -- for instance -- you'd move into the specified
     * directory and then do your yarn/npm adds to this directory
     */
    path: string;
    /** what is says on the tin ... a description of your layer */
    description: string;
  };
}

export type ServerlessFunctionMemorySize =
  | 128
  | 192
  | 256
  | 320
  | 384
  | 448
  | 512
  | 576
  | 640
  | 704
  | 768
  | 832
  | 896
  | 960
  | 1024
  | 1088
  | 1152
  | 1216
  | 1280
  | 1344
  | 1408
  | 1472
  | 1536
  | 1600
  | 1664
  | 1728
  | 1792
  | 1856
  | 1920
  | 1984
  | 2048
  | 2112
  | 2176
  | 2240
  | 2304
  | 2368
  | 2432
  | 2496
  | 2560
  | 2624
  | 2688
  | 2752
  | 2816
  | 2880
  | 2944
  | 3008;

export interface IServerlessStatusCode {
  pattern: string;
  template?: string | IDictionary;
  headers: IDictionary;
}

export interface IServerlessRequest<T = unknown> {
  template?: IDictionary;
  parameters?: {
    querystrings?: IDictionary;
    headers?: IDictionary;
    paths?: IDictionary;
  };
  schema: T;
  passThrough?: "NEVER" | "WHEN_NO_MATCH" | "WHEN_NO_TEMPLATES";
}

export interface IServerlessHttpAuthorizer {
  arn: string;
  claims?: string[];
  resultTtlInSeconds?: number;
  identitySource?: string | string[];
  identityValidationExpression?: string;
  type?: string;
}

export interface IServerlessRootConfig {
  service: string | { name: string };
  /** the major version of the serverless framework being used; defaults to 2 */
  frameworkVersion?: 1 | 2;
  /**
   * Modes for config validation. `error` throws an exception, `warn` logs error to console,
   * `off` disables validation at all. The default is warn.
   */
  configValidationMode?: "error" | "warn" | "off";
  /**
   * If set to 'true', guarantees that it's a locally (for service, in its node_modules) installed
   * framework which processes the command
   */
  enableLocalInstallationFallback?: boolean;
  /**
   * If set to 'true', environment variables will be automatically loaded from .env files
   */
  useDotenv?: boolean;
  /**
   * To crash on variable resolution errors (as coming from new resolver),
   * set this value to "20210219".
   */
  variablesResolutionMode?: null | "20210219";
  /**
   * If set to 'error', references to variables that cannot be resolved will result in an error
   * being thrown (applies to legacy resolver)
   */
  unresolvedVariablesNotificationMode?: "warn" | "error";
  /** Disable deprecation logs by their codes. Default is empty. */
  disableDeprecations?: undefined | "DEP_CODE_1" | "*";
}

/**
 * The data structure of a `serverless.yml` file converted to
 * typescript.
 */
export interface IServerlessYaml<T = IServerlessConfigCustom> extends IServerlessRootConfig {
  package: IServerlessPackage;
  custom?: T;
  plugins?: string[];
  provider: IServerlessProvider;
  resources?: IServerlessResources;
  functions?: Record<string, IServerlessFunction>;
  stepFunctions?: {
    stateMachines: Record<string, IStateMachine>;
    activities?: string[];
  };
  layers?: IArnStringReference[] | ICloudformationReference[] | ILayerDefinition;
  logs?: IServerlessLogging;
  tracing?: IServerlessTracing;
}

/**
 * This string should follow its format and it will be used to populate values read from yaml file
 */
export type YamlExpression<T extends string = string> = `$\{${string}${T}${string}\}`;
