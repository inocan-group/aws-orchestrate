import { IDictionary } from "common-types";

export interface IApiGatewaySuccessOptions {
  /**
   * Optionally add headers to the default headers provided
   */
  headers?: IDictionary;

  /**
   * By default this is set to false but can be overriden
   */
  base64Encode?: boolean;
}
