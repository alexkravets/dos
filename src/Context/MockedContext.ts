import Context from './Context';
import { OpenAPIV2 } from 'openapi-types';
import { type Validator } from '@kravc/schema';

/** Mocked context class for unit tests. */
class MockedContext extends Context {
  /** Creates an instance of the mocked context. */
  constructor(operationId: string) {
    const spec = {
      paths: {
        [`/${operationId}`]: {
          get: {}
        }
      }
    } as OpenAPIV2.Document;

    super({ spec, validator: {} as Validator }, { operationId }, {});
  }
}

export default MockedContext;
