import { OpenAPIV2 } from 'openapi-types';
import type { Request, InternalRequest, HttpRequest } from './Request';

const UNDEFINED_VALUE = 'undefined';

/** Returns HTTP method of a request. */
const getHttpMethod = (spec: OpenAPIV2.Document, request: Request): string => {
  const { operationId } = request as InternalRequest;

  if (operationId) {
    const [ method = UNDEFINED_VALUE ] = Object.keys(spec.paths[`/${operationId}`] || {});
    return method;
  }

  const { method, httpMethod } = request as HttpRequest;

  return (method || httpMethod!).toLowerCase();
};

export default getHttpMethod;
