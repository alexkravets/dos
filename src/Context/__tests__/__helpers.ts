import { OpenAPIV2 } from 'openapi-types';
import { Schema, Validator } from '@kravc/schema';
import { Context, type Identity } from '../../';
import type { Request, LambdaRequest, ExtraContext } from '../Request';

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
  request?: Request;
  schemas?: Schema[];
  identity?: Identity;
  extraContext?: ExtraContext;
};

/** Creates an instace of an operation context. */
export const createContext = (props: Props = {}): Context => {
  const {
    request = DEFAULT_LAMBDA_REQUEST,
    schemas = [ profileSchema ],
    identity = {},
    extraContext = {},
  } = props;

  const validator = new Validator(schemas);

  const spec = {
    basePath: '/api',
    paths: {
      [`/${operationId}`]: {
        get: {
          operationId,
        },
      },
      ['/CreateProfile']: {
        post: {
          operationId: 'CreateProfile',
        },
      },
      ['/UpdateProfile']: {
        post: {
          operationId: 'UpdateProfile',
        },
      },
      ['/DeleteProfile']: {
        delete: {
          operationId: 'DeleteProfile',
        },
      },
      ['/ReadProfile']: {
        get: {
          operationId: 'ReadProfile',
        },
      },
      ['/IndexProfiles']: {
        get: {
          operationId: 'IndexProfiles',
        },
      },
      ['/ListProfiles']: {
        get: {
          operationId: 'ListProfiles',
        },
      },
      ['/Health']: {
        get: {
          operationId: 'Health',
        },
      }
    }
  } as unknown as OpenAPIV2.Document;

  const context = new Context({ spec, validator }, request, extraContext);
  context.identity = identity;

  return context;
};
