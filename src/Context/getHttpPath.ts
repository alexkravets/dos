import { parse } from 'url';
import { OpenAPIV2 } from 'openapi-types';
import type { Request, InternalRequest, HttpRequest } from './Request';

/** Returns HTTP path of a request. */
const getHttpPath = (spec: OpenAPIV2.Document, request: Request): string => {
  const { basePath } = spec;
  const { operationId } = request as InternalRequest;

  if (operationId) {
    return `/${operationId}`;
  }

  const httpRequest = request as HttpRequest;

  let { path } = httpRequest;

  if (!path) {
    path = parse(httpRequest.url!, true).pathname!;
  }

  const httpPath = path.replace(basePath!, '/');

  return httpPath;
};

export default getHttpPath;
