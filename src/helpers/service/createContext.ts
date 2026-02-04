import { get } from 'lodash';
import { Validator } from '@kravc/schema';
import { OpenAPIV2 } from 'openapi-types';
import { v4 as uuid } from 'uuid';
import getQueryParameters from './getQueryParameters';
import getMutationParameters from './getMutationParameters';
import getOperationId, { getHttpPath, getHttpMethod } from './getOperationId';
import type { Headers, ExtraContext, Context, Request } from '../../Context';

type Options = {
  spec: OpenAPIV2.Document;
  baseUrl: string;
  validator: Validator,
}

/** Creates operation execution context object. */
const createContext = ({
  spec,
  baseUrl,
  validator,
}: Options, request: Request, extraContext: ExtraContext = {}) => {
  const { logger = console } = extraContext;

  const headers = {} as Headers;

  for (const name in request.headers) {
    headers[name.toLowerCase()] = request.headers[name];
  }

  const query = getQueryParameters(request);
  const httpPath = getHttpPath(spec, request);
  const requestId = get(request, 'requestContext.requestId', uuid());
  const httpMethod = getHttpMethod(spec, request);
  const operationId = getOperationId(spec, request);
  const requestReceivedAt = new Date().toISOString();
  const { bodyJson, mutation } = getMutationParameters(request);

  const context = {
    query,
    logger,
    baseUrl,
    headers,
    httpPath,
    bodyJson,
    mutation,
    validator,
    requestId,
    httpMethod,
    operationId,
    requestReceivedAt,
    ...extraContext,
  } as Context;

  return context;
};

export default createContext;
