import { got } from '@kravc/schema';
import { OpenAPIV2 } from 'openapi-types';
import type { Request, LambdaRequest, HttpRequest } from './Request';

/** Returns HTTP method of a request. */
const getHttpMethod = (spec: OpenAPIV2.Document, request: Request): string => {
  const { operationId } = request as LambdaRequest;

  if (operationId) {
    const methods = Object.keys(got(spec.paths, `/${operationId}`) as OpenAPIV2.PathsObject);
    const method = methods[0] as string;

    return method;
  }

  const { method, httpMethod } = request as HttpRequest;

  return (method || httpMethod!).toLowerCase();
};

export default getHttpMethod;
