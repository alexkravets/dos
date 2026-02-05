import { get } from 'lodash';
import getHttpPath from './getHttpPath';
import getHttpMethod from './getHttpMethod';
import { OpenAPIV2 } from 'openapi-types';
import type { Request, LambdaRequest } from './Request';

const UNDEFINED_VALUE = 'undefined';

/** Returns operation ID for a request. */
const getOperationId = (spec: OpenAPIV2.Document, request: Request): string => {
  const { operationId } = request as LambdaRequest;

  if (operationId) {
    return operationId;
  }

  const httpPath = getHttpPath(spec, request);
  const httpMethod = getHttpMethod(spec, request);

  return get(spec.paths, `${httpPath}.${httpMethod}.operationId`, UNDEFINED_VALUE) as string;
};

export default getOperationId;
