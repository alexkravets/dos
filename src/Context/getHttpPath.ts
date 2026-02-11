import { get } from 'lodash';
import { OpenAPIV2 } from 'openapi-types';
import type { Request, LambdaRequest, HttpRequest } from './Request';

/** Returns HTTP path of a request. */
const getHttpPath = (spec: OpenAPIV2.Document, request: Request): string => {
  const { basePath } = spec;
  const { operationId } = request as LambdaRequest;

  if (operationId) {
    return `/${operationId}`;
  }

  const httpRequest = request as HttpRequest;

  let { path } = httpRequest;

  if (!path) {
    const { url } = httpRequest;
    const isLocalhost = url.startsWith('/');

    const _url = isLocalhost
      ? new URL(`http://localhost:3000/${url}`)
      : new URL(url);

    path = get(_url, 'pathname', '/');
  }

  const httpPath = path
    .replace(basePath!, '/')
    .replace('//', '/');

  return httpPath;
};

export default getHttpPath;
