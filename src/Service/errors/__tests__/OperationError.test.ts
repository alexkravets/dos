import { logger } from '../../../../example';
import OperationError from '../OperationError';
import { createContext } from '../../../Context/__tests__/__helpers';

describe('OperationError', () => {
  describe('OperationError.constructor(context, statusCode, originalError)', () => {
    it('creates operation error for an unexpected error', () => {
      const context = createContext({ extraContext: { logger }});

      const originalError = new Error('Example of unexpected error');
      const operationError = new OperationError(context, 500, originalError);

      expect(operationError.attributes.error.code).toEqual('OperationError');
      expect(operationError.attributes.error.message).toEqual('Unexpected operation error');
    });
  });
});
