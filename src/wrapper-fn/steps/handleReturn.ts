import { HttpStatusCodes, IAwsApiGatewayResponse, IDictionary } from "common-types";
import { IWrapperContext } from "~/types";
import { getResponseHeaders, getStatusCode } from "../util";

/**
 * When the wrapper function gets a returned value from the _handler function_
 * this function is responsible for returning the appropriate response to
 * the caller.
 */
export function handleReturn<O, Q, P>(
  response: O,
  context: IWrapperContext<Q, P>,
  duration: number,
  prepTime: number
): O | IAwsApiGatewayResponse {
  const log = context.log;
  const statusCode = getStatusCode();

  if (context.isApiGatewayRequest) {
    // API Gateway - Returned Results
    const res: IAwsApiGatewayResponse = {
      statusCode: statusCode ? statusCode : response ? HttpStatusCodes.Success : HttpStatusCodes.NoContent,
      headers: getResponseHeaders() as IDictionary,
      body: response ? (typeof response === "string" ? response : JSON.stringify(response)) : "",
    };
    // Note: a handler function can set the HTTP error status to an error status
    // and still return a result that will be passed as the body
    const isErrorState = res.statusCode >= 400;

    if (isErrorState) {
      log.info(`Done. Returning error results to API Gateway [${res.statusCode}]`, {
        success: false,
        response: res,
        duration,
        prepTime,
      });
    } else {
      log.info(`Done. Returning successful results to API Gateway.`, {
        success: true,
        response: res,
        duration,
        prepTime,
      });
    }

    // API Gateway response
    return res;
  } else {
    // Non-API Gateway callers
    log.info(`Done. Returning successfully to caller [${context.caller}]`, {
      success: true,
      response,
      duration,
      prepTime,
    });
    return response;
  }
}
