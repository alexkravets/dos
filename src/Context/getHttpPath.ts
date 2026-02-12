import { get } from 'lodash';
import { OpenAPIV2 } from 'openapi-types';
import type { Request, LambdaRequest, HttpRequest } from './Request';

const BASE_URL = 'http://localhost:3000';

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
    const _url = new URL(url, BASE_URL);

    path = get(_url, 'pathname', '/');
  }

  const httpPath = path
    .replace(basePath!, '/')
    .replace('//', '/');

  return httpPath;
};

export default getHttpPath;
