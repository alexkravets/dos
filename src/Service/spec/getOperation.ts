import Operation from '../../Operation';
import { OpenAPIV2 } from 'openapi-types';
import getServiceTags from './getServiceTags';
import getSuccessStatusCode from './getSuccessStatusCode';
import getOperationParameters from './getOperationParameters';
import getErrorResponseDescription, { type Error } from './getErrorResponseDescription';

/** Returns operation specification for an operation class. */
const getOperation = (OperationClass: typeof Operation): OpenAPIV2.OperationObject => {
  const operationId = OperationClass.id;
  const operationTags = getServiceTags([ OperationClass ]).map(({ name }) => name);

  const {
    errors,
    summary,
    security,
    isCreate,
    hasOutput,
    description,
    permissions,
    outputSchema,
  } = OperationClass;

  const operationSummary = permissions
    ? `[${permissions.join(',')}] ${summary}`
    : summary;

  const operationSpec = {
    tags: operationTags,
    summary: operationSummary,
    description,
    operationId,
  } as OpenAPIV2.OperationObject;

  const parameters = getOperationParameters(OperationClass);
  const hasParameters = parameters.length > 0;

  if (hasParameters) {
    operationSpec.parameters = parameters;
  }

  const successStatusCode = getSuccessStatusCode(isCreate, hasOutput);

  const success = {
    description: 'Successful operation execution response'
  } as OpenAPIV2.ResponseObject;

  if (outputSchema) {
    success.schema = { $ref: outputSchema.id };
  }

  const responses = {
    [successStatusCode]: success,
    default: {
      description: '`OperationError` — Default operation error',
      schema: { $ref: 'OperationError' }
    }
  };

  const errorsMap = {} as Record<string, Error[]>;

  for (const code in errors) {
    const { statusCode, description } = errors[code];

    errorsMap[`${statusCode}`] = errorsMap[`${statusCode}`] || [];
    errorsMap[`${statusCode}`].push({ code, description });
  }

  for (const statusCode in errorsMap) {
    const description = getErrorResponseDescription(errorsMap[statusCode]);

    responses[`${statusCode}`] = {
      schema: { $ref: 'OperationError' },
      description
    };
  }

  operationSpec.responses = responses;

  const hasSecurityRequirements = security.length > 0;

  if (hasSecurityRequirements) {
    operationSpec.security = [];

    for (const requirements of security) {
      const config = {} as OpenAPIV2.SecurityRequirementObject;

      for (const name in requirements) {
        config[name] = [];
      }

      operationSpec.security.push(config);
    }
  }

  return operationSpec;
};

export default getOperation;
