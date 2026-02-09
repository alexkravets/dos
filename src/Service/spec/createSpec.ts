import ZSchema from 'z-schema';
import { parse } from 'url';
import Operation from '../../Operation';
import { Schema } from '@kravc/schema';
import jsonSchema from '../../../assets/schemas/oas2.json';
import getOperation from './getOperation';
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
  const {
    path: basePath,
    protocol: _protocol,
    host,
  } = parse(url);

  const protocol = (_protocol || '').replace(':', '');

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

  const result = JSON.parse(specJson);

  const validator = new ZSchema({ ignoreUnknownFormats: true });
  const isValid = validator.validate(result, { ...jsonSchema, id: 'Spec' });

  if (!isValid) {
    const validationErrors = validator.getLastErrors();
    const errorsJson = JSON.stringify(validationErrors, null, 2);

    throw new Error(`Service spec validation failed: ${errorsJson}\nService spec: ${specJson}`);
  }

  return result;
};

export default createSpec;
