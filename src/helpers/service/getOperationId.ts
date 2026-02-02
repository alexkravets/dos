import { get } from 'lodash';
import { parse } from 'url';
import { OpenAPIV2 } from 'openapi-types';
import type { Request } from '../../Context';

const UNDEFINED_VALUE = 'undefined';

/** Returns HTTP path of a request. */
export const getHttpPath = (spec: OpenAPIV2.Document, request: Request): string => {
  const { basePath } = spec;
  const { operationId } = request;

  if (operationId) {
    return `/${operationId}`;
  }

  let { path } = request;

  if (!path) {
    path = parse(request.url!, true).pathname!;
  }

  const httpPath = path.replace(basePath!, '/');

  return httpPath;
};

/** Returns HTTP method of a request. */
export const getHttpMethod = (spec: OpenAPIV2.Document, request: Request): string => {
  const { method, httpMethod, operationId } = request;

  if (operationId) {
    const [ method = UNDEFINED_VALUE ] = Object.keys(spec.paths[`/${operationId}`] || {});
    return method;
  }

  return (method || httpMethod!).toLowerCase();
};

/** Returns operation ID for a request. */
const getOperationId = (spec: OpenAPIV2.Document, request: Request): string => {
  const { operationId } = request;

  if (operationId) {
    return operationId;
  }

  const httpPath = getHttpPath(spec, request);
  const httpMethod = getHttpMethod(spec, request);

  return get(spec.paths, `${httpPath}.${httpMethod}.operationId`, UNDEFINED_VALUE) as string;
};

export default getOperationId;
