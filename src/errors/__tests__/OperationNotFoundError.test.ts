import OperationNotFoundError from '../OperationNotFoundError';
import CommonError from '../CommonError';

describe('OperationNotFoundError', () => {
  describe('constructor', () => {
    it('creates an instance with operation search parameters', () => {
      const parameters = {
        operationId: 'CreateProfile',
        httpMethod: 'POST',
        httpPath: '/profiles'
      };
      const err = new OperationNotFoundError(parameters);

      expect(err.code).toBe('OperationNotFoundError');
      expect(err.message).toContain('Operation not found');
      expect(err.message).toContain('CreateProfile');
      expect(err.message).toContain('POST');
      expect(err.message).toContain('/profiles');
    });

    it('formats parameters as JSON in error message', () => {
      const parameters = {
        operationId: 'ReadProfile',
        httpMethod: 'GET',
        httpPath: '/profiles/123'
      };
      const err = new OperationNotFoundError(parameters);

      const message = err.message;
      expect(message).toContain('Operation not found');
      // Check that JSON is properly formatted (with newlines and indentation)
      expect(message).toMatch(/Operation not found,\s*\{/);
      expect(message).toContain('"operationId": "ReadProfile"');
      expect(message).toContain('"httpMethod": "GET"');
      expect(message).toContain('"httpPath": "/profiles/123"');
    });

    it('handles empty parameters object', () => {
      const err = new OperationNotFoundError({});

      expect(err.code).toBe('OperationNotFoundError');
      expect(err.message).toContain('Operation not found');
      expect(err.message).toContain('{}');
    });

    it('handles parameters with additional fields', () => {
      const parameters = {
        operationId: 'UpdateProfile',
        httpMethod: 'PUT',
        httpPath: '/profiles/123',
        extraField: 'extraValue'
      };
      const err = new OperationNotFoundError(parameters);

      expect(err.message).toContain('UpdateProfile');
      expect(err.message).toContain('PUT');
      expect(err.message).toContain('/profiles/123');
      expect(err.message).toContain('extraField');
    });
  });

  describe('code', () => {
    it('returns "OperationNotFoundError"', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };
      expect(new OperationNotFoundError(parameters).code).toBe('OperationNotFoundError');
    });
  });

  describe('statusCode', () => {
    it('returns 404', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };
      expect(new OperationNotFoundError(parameters).statusCode).toBe(404);
    });

    it('always returns 404 regardless of parameters', () => {
      expect(new OperationNotFoundError({}).statusCode).toBe(404);
      expect(new OperationNotFoundError({ operationId: 'Test' }).statusCode).toBe(404);
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };
      expect(new OperationNotFoundError(parameters).isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };
      const operationNotFoundErr = new OperationNotFoundError(parameters);
      const plainErr = new Error('Oops');

      expect(operationNotFoundErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };
      const err = new OperationNotFoundError(parameters);
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(OperationNotFoundError);
    });

    it('has a non-empty stack when thrown', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };
      let err: OperationNotFoundError | undefined;
      try {
        throw new OperationNotFoundError(parameters);
      } catch (e) {
        err = e as OperationNotFoundError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Operation not found');
      expect(err!.stack).toContain('OperationNotFoundError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code, message, and statusCode when thrown and caught', () => {
      const parameters = {
        operationId: 'CreateProfile',
        httpMethod: 'POST',
        httpPath: '/profiles'
      };

      let caught: OperationNotFoundError | undefined;
      try {
        throw new OperationNotFoundError(parameters);
      } catch (e) {
        caught = e as OperationNotFoundError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('OperationNotFoundError');
      expect(caught!.message).toContain('Operation not found');
      expect(caught!.statusCode).toBe(404);
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };

      let caught: CommonError | undefined;
      try {
        throw new OperationNotFoundError(parameters);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('OperationNotFoundError');
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };
      const err = new OperationNotFoundError(parameters);

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('OperationNotFoundError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const parameters = { operationId: 'Test', httpMethod: 'GET', httpPath: '/' };
      const err = new OperationNotFoundError(parameters);

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('statusCode');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('OperationNotFoundError');
      expect(err.statusCode).toBe(404);
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with operation routing failures', () => {
      const parameters = {
        operationId: 'NonExistentOperation',
        httpMethod: 'POST',
        httpPath: '/unknown'
      };
      const err = new OperationNotFoundError(parameters);

      expect(err.code).toBe('OperationNotFoundError');
      expect(err.statusCode).toBe(404);
      expect(err.message).toContain('NonExistentOperation');
    });

    it('works with API versioning scenarios', () => {
      const parameters = {
        operationId: 'CreateProfileV1',
        httpMethod: 'POST',
        httpPath: '/v1/profiles'
      };
      const err = new OperationNotFoundError(parameters);

      expect(err.code).toBe('OperationNotFoundError');
      expect(err.statusCode).toBe(404);
      expect(err.message).toContain('CreateProfileV1');
    });

    it('works with dynamic operation loading failures', () => {
      const parameters = {
        operationId: 'DynamicOperation',
        httpMethod: 'GET',
        httpPath: '/dynamic'
      };
      const err = new OperationNotFoundError(parameters);

      expect(err.code).toBe('OperationNotFoundError');
      expect(err.statusCode).toBe(404);
      expect(err.message).toContain('DynamicOperation');
    });

    it('formats complex parameters correctly', () => {
      const parameters = {
        operationId: 'ComplexOperation',
        httpMethod: 'PATCH',
        httpPath: '/complex/resource/123',
        query: { filter: 'active' },
        headers: { 'Content-Type': 'application/json' }
      };
      const err = new OperationNotFoundError(parameters);

      const message = err.message;
      expect(message).toContain('ComplexOperation');
      expect(message).toContain('PATCH');
      expect(message).toContain('/complex/resource/123');
    });
  });
});
