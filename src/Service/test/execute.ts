import Service from '../Service';
import { type ErrorAttributes } from '../errors';
import type { Headers, MutationMap, LambdaRequest, Logger } from '../../Context';

const SUCCESS_HTTP_CODES = [ 200, 201, 204 ];
const NO_RESPONSE_HTTP_CODE = 204;

type Parameters = {
  mutation?: MutationMap;
  [index: string]: unknown;
}

type SuccessResult = { data: Record<string, unknown>; };
type ErrorResult = { error: ErrorAttributes; };
type Result = SuccessResult | ErrorResult;

type Options = {
  logger?: Logger
};

/** Returns helpers to process requests successfully or expect an error. */
const execute = (service: Service, options: Options = {}) => {
  const { logger = console } = options;

  /** Processes an operation parameters via service. */
  const exec = async (operationId: string, parameters: Parameters = {}, headers: Headers = {}) => {
    const { mutation: body, ...queryStringParameters } = parameters;

    const request = {
      body,
      headers,
      operationId,
      queryStringParameters
    } as LambdaRequest;

    const response = await service.process(request);

    let result;

    if (response.body) {
      result = JSON.parse(response.body) as Result;
    }

    return { ...response, result };
  };

  /** Processes an operation parameters via service, expects successfull response. */
  const request = async (operationId: string, parameters: Parameters = {}, headers: Headers = {}) => {
    const {
      result,
      statusCode,
    } = await exec(operationId, parameters, headers);

    let data;

    const isResultExpected = statusCode !== NO_RESPONSE_HTTP_CODE;

    if (isResultExpected) {
      data = (result as SuccessResult).data;
    }

    const isSuccess = SUCCESS_HTTP_CODES.includes(statusCode);

    if (!isSuccess) {
       const { error } = (result as ErrorResult);

      logger.error(`\x1b[31mRequestError for "${operationId}"\x1b[37m`);
      logger.dir({ operationId, parameters, error }, { depth: null });

      throw Error(`RequestError for "${operationId}"`);
    }

    return data;
  };

  /** Processes an operation parameters via service, expects an error with a specific code. */
  const expectError = async (errorCode: string, operationId: string, parameters: Parameters = {}, headers: Headers = {}) => {
    const {
      result,
      statusCode,
    } = await exec(operationId, parameters, headers);

    const isSuccess = SUCCESS_HTTP_CODES.includes(statusCode);

    if (isSuccess) {
      const { data } = (result as SuccessResult);

      logger.error(`\x1b[31mSuccess NOT expected for "${operationId}"\x1b[37m`);
      logger.dir({ operationId, statusCode, parameters, data }, { depth: null });

      throw Error(`Success NOT expected for "${operationId}"`);
    }

    const { error } = (result as ErrorResult);

    const isExpectedCode = error.code === errorCode;

    if (!isExpectedCode) {
      throw Error(`Unexpected error code received "${error.code}", expected "${errorCode}"`);
    }

    return error;
  };

  return {
    exec,
    request,
    expectError,
  };
};

export default execute;
