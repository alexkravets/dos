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
  id: {},
  name: { required: true },
}, 'Profile');

type Props = {
  request?: Request,
  schemas?: Schema[],
};

/** Creates an instace of an operation context. */
export const createContext = (props: Props = {}): Context => {
  const {
    request = DEFAULT_LAMBDA_REQUEST,
    schemas = [ profileSchema ],
  } = props;

  const validator = new Validator(schemas);

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
