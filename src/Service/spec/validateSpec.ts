import ZSchema from 'z-schema';
import jsonSchema from '../../../assets/schemas/oas2.json';
import { OpenAPIV2 } from 'openapi-types';

/** Validates service specification JSON schema. */
const validateSpec = (specJson: string): OpenAPIV2.Document => {
  const spec = JSON.parse(specJson);

  const validator = new ZSchema({ ignoreUnknownFormats: true });
  const isValid = validator.validate(spec, { ...jsonSchema, id: 'Spec' });

  if (isValid) {
    return spec;
  }

  const validationErrors = validator.getLastErrors();
  const errorsJson = JSON.stringify(validationErrors, null, 2);

  throw new Error(`Service spec validation failed: ${errorsJson}\nService spec: ${specJson}`);
};

export default validateSpec;
