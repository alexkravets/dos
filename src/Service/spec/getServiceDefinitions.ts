import { omit } from 'lodash';
import { Schema } from '@kravc/schema';
import { OpenAPIV2 } from 'openapi-types';

/** Returns service definitions. */
const getServiceDefinitions = (schemasMap: Record<string, Schema>) => {
  const definitions = {} as Record<string, OpenAPIV2.SchemaObject>;

  for (const schemaId in schemasMap) {
    const isNotInputSchema = !schemaId.endsWith('Input');

    if (isNotInputSchema) {
      const schema = schemasMap[schemaId];
      const definition = omit(schema.jsonSchema, [ 'id' ]) as OpenAPIV2.SchemaObject;

      definitions![schemaId] = definition;
    }
  }

  return definitions;
};

export default getServiceDefinitions;
