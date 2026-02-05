import Operation from '../../Operation';
import { OpenAPIV2 } from 'openapi-types';

/** Returns operation parameters. */
const getOperationParameters = (OperationClass: typeof Operation) => {
  const parameters = [] as OpenAPIV2.Parameter[];

  const {
    query,
    mutationSchema
  } = OperationClass;

  for (const name in query) {
    const _queryParameter = query[name];

    const queryParameter = {
      in: 'query',
      type: 'string',
      name,
      ..._queryParameter
    } as OpenAPIV2.GeneralParameterObject;

    if (queryParameter.example) {
      queryParameter['x-example'] = queryParameter.example;
      delete queryParameter.example;
    }

    parameters.push(queryParameter);
  }

  if (mutationSchema) {
    parameters.push({
      in: 'body',
      name: 'mutation',
      schema: { $ref: mutationSchema.id },
      required: true
    } as OpenAPIV2.InBodyParameterObject);
  }

  return parameters;
};

export default getOperationParameters;
