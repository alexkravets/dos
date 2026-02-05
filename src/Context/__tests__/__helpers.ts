import { Context } from '../';
import { OpenAPIV2 } from 'openapi-types';
import { Schema, Validator } from '@kravc/schema';
import type { Request, LambdaRequest } from '../Request';

const operationId = 'TestOperationId';

const DEFAULT_LAMBDA_REQUEST = {
  headers: {},
  operationId,
} as LambdaRequest;

export const profileSchema = new Schema({
  id: { required: true },
  name: {}
}, 'Profile');

/** Creates an instace of an operation context. */
export const createContext = (request: Request = DEFAULT_LAMBDA_REQUEST): Context => {
  const validator = new Validator([ profileSchema ]);

  const spec = {
    basePath: '/api',
    paths: {
      [`/${operationId}`]: {
        get: {
          operationId,
        },
      }
    }
  } as unknown as OpenAPIV2.Document;

  const context = new Context({ spec, validator }, request);

  return context;
};
