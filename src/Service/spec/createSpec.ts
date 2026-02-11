import { get } from 'lodash';
import Operation from '../../Operation';
import { Schema } from '@kravc/schema';
import getOperation from './getOperation';
import validateSpec from './validateSpec';
import { OpenAPIV2 } from 'openapi-types';
import getHttpMethod from './getHttpMethod';
import getServiceInfo from './getServiceInfo';
import getServiceTags from './getServiceTags';
import getServiceDefinitions from './getServiceDefinitions';
import getServiceSecurityDefinitions from './getServiceSecurityDefinitions';

/** Creates a specification for a service. */
const createSpec = (
  operations: (typeof Operation)[],
  schemasMap: Record<string, Schema>,
  url: string
): OpenAPIV2.Document => {
  const _url = new URL(url);

  const host = _url.host;
  const basePath = get(_url, 'pathname', '/');
  const protocol = _url.protocol.replace(':', '');

  const info = getServiceInfo();
  const tags = getServiceTags(operations);
  const swagger = '2.0';
  const schemes = [ protocol ];
  const consumes = [ 'application/json' ];
  const produces = [ 'application/json' ];
  const definitions = getServiceDefinitions(schemasMap);
  const securityDefinitions = getServiceSecurityDefinitions(operations);

  const paths = {} as OpenAPIV2.PathsObject;

  for (const OperationClass of operations) {
    const httpPath = `/${OperationClass.id}`;
    const httpMethod = getHttpMethod(OperationClass.type);

    paths[httpPath] = {
      [httpMethod]: getOperation(OperationClass)
    };
  }

  const spec = {
    swagger,
    info,
    host,
    basePath,
    consumes,
    produces,
    tags,
    paths,
    schemes,
    definitions,
    securityDefinitions,
  } as OpenAPIV2.Document;

  const specJson = JSON
    .stringify(spec, null, 2)
    .replace(/"\$ref": "/g, '"$ref": "#/definitions/');

  const result = validateSpec(specJson);

  return result;
};

export default createSpec;
