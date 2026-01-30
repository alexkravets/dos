import OperationError from '../OperationError';
import { Context } from '../../Context';
import { Validator, Schema, loadSync } from '@kravc/schema';
import { logOperationError, type OriginalError } from '../../helpers/error';

// Mock logOperationError
jest.mock('../../helpers/error', () => ({
  __esModule: true,
  logOperationError: jest.fn()
}));

const mockedLogOperationError = logOperationError as jest.MockedFunction<typeof logOperationError>;

describe('OperationError', () => {
  let validator: Validator;
  let context: Context;
  let mockLogger: { error: jest.Mock };

  beforeEach(() => {
    mockLogger = {
      error: jest.fn()
    };

    // Load OperationError schema
    const operationErrorSchema = loadSync(
      require.resolve('../OperationError.yaml')
    ) as Schema;

    validator = new Validator([operationErrorSchema]);

    context = {
      validator,
      logger: mockLogger
    };

    mockedLogOperationError.mockClear();
  });

  describe('static schema', () => {
    it('returns the operation error schema', () => {
      const schema = OperationError.schema;
      expect(schema).toBeDefined();
      expect(schema).toHaveProperty('_source');
      expect((schema as any)._source).toHaveProperty('error');
    });
  });

  describe('constructor with common error', () => {
    it('creates OperationError with original error code and message', () => {
      const originalError: OriginalError = {
        code: 'DocumentNotFoundError',
        message: 'Profile not found',
        isCommonError: true
      };

      const operationError = new OperationError(context, 404, originalError);

      expect(operationError.attributes).toEqual({
        error: {
          code: 'DocumentNotFoundError',
          message: 'Profile not found',
          statusCode: 404
        }
      });
    });

    it('does not log error when statusCode is not 500', () => {
      const originalError: OriginalError = {
        code: 'DocumentNotFoundError',
        message: 'Profile not found',
        isCommonError: true
      };

      new OperationError(context, 404, originalError);

      expect(mockedLogOperationError).not.toHaveBeenCalled();
    });

    it('preserves validation errors when present', () => {
      const validationErrors = [
        { path: 'email', message: 'Invalid email format', code: 'format' },
        { path: 'age', message: 'Must be a number', code: 'type' }
      ] as any[];

      const originalError: OriginalError = {
        code: 'InvalidInputError',
        message: 'Validation failed',
        isCommonError: true,
        validationErrors
      };

      const operationError = new OperationError(context, 400, originalError);

      expect(operationError.attributes).toEqual({
        error: {
          code: 'InvalidInputError',
          message: 'Validation failed',
          statusCode: 400,
          validationErrors
        }
      });
    });

    it('handles error without validation errors', () => {
      const originalError: OriginalError = {
        code: 'UnauthorizedError',
        message: 'Authentication required',
        isCommonError: true
      };

      const operationError = new OperationError(context, 401, originalError);

      const error = operationError.attributes.error as Record<string, unknown>;
      expect(error).not.toHaveProperty('validationErrors');
    });
  });

  describe('constructor with unexpected error', () => {
    it('sanitizes unexpected error by replacing code and message', () => {
      const originalError: OriginalError = {
        message: 'Cannot read property "id" of undefined',
        stack: 'TypeError: Cannot read property "id" of undefined\n    at test.js:10:5'
        // isCommonError is undefined/false
      };

      const operationError = new OperationError(context, 500, originalError);

      expect(operationError.attributes).toEqual({
        error: {
          code: 'OperationError',
          message: 'Unexpected operation error',
          statusCode: 500
        }
      });
    });

    it('treats error as unexpected when isCommonError is false', () => {
      const originalError: OriginalError = {
        code: 'SomeError',
        message: 'Some error message',
        isCommonError: false
      };

      const operationError = new OperationError(context, 500, originalError);

      const error = operationError.attributes.error as { code: string; message: string; statusCode: number };
      expect(error.code).toBe('OperationError');
      expect(error.message).toBe('Unexpected operation error');
    });

    it('treats error as unexpected when isCommonError is undefined', () => {
      const originalError: OriginalError = {
        message: 'Some error'
        // isCommonError is undefined
      };

      const operationError = new OperationError(context, 500, originalError);

      const error = operationError.attributes.error as { code: string; message: string; statusCode: number };
      expect(error.code).toBe('OperationError');
      expect(error.message).toBe('Unexpected operation error');
    });

    it('logs unexpected error when statusCode is 500', () => {
      const originalError: OriginalError = {
        message: 'Unexpected error',
        stack: 'Error: Unexpected error'
      };

      const operationError = new OperationError(context, 500, originalError);

      expect(mockedLogOperationError).toHaveBeenCalledTimes(1);
      expect(mockedLogOperationError).toHaveBeenCalledWith(
        context,
        expect.objectContaining({
          code: 'OperationError',
          message: 'Unexpected operation error',
          statusCode: 500
        }),
        originalError
      );
    });
  });

  describe('error logging', () => {
    it('logs error only when statusCode is 500', () => {
      const originalError500: OriginalError = {
        message: 'Internal error',
        isCommonError: true
      };

      const originalError400: OriginalError = {
        message: 'Bad request',
        isCommonError: true
      };

      new OperationError(context, 500, originalError500);
      expect(mockedLogOperationError).toHaveBeenCalledTimes(1);

      mockedLogOperationError.mockClear();

      new OperationError(context, 400, originalError400);
      expect(mockedLogOperationError).not.toHaveBeenCalled();
    });

    it('passes correct error attributes to logOperationError', () => {
      const originalError: OriginalError = {
        code: 'TestError',
        message: 'Test error',
        isCommonError: true
      };

      new OperationError(context, 500, originalError);

      const callArgs = mockedLogOperationError.mock.calls[0];
      expect(callArgs[0]).toBe(context);
      expect(callArgs[1]).toEqual({
        code: 'TestError',
        message: 'Test error',
        statusCode: 500
      });
      expect(callArgs[2]).toBe(originalError);
    });

    it('passes sanitized error attributes for unexpected errors', () => {
      const originalError: OriginalError = {
        message: 'Real error message',
        stack: 'Error stack'
      };

      new OperationError(context, 500, originalError);

      const callArgs = mockedLogOperationError.mock.calls[0];
      expect(callArgs[1]).toEqual({
        code: 'OperationError',
        message: 'Unexpected operation error',
        statusCode: 500
      });
    });
  });

  describe('Component inheritance', () => {
    it('extends Component and has componentId', () => {
      const originalError: OriginalError = {
        message: 'Test error',
        isCommonError: true
      };

      const operationError = new OperationError(context, 400, originalError);

      expect(operationError.componentId).toBe('OperationError');
    });

    it('has access to context', () => {
      const originalError: OriginalError = {
        message: 'Test error',
        isCommonError: true
      };

      const operationError = new OperationError(context, 400, originalError);

      expect(operationError.context).toBe(context);
      expect(operationError.context.validator).toBe(validator);
      expect(operationError.context.logger).toBe(mockLogger);
    });

    it('can validate against schema', () => {
      const originalError: OriginalError = {
        code: 'TestError',
        message: 'Test error message',
        isCommonError: true
      };

      const operationError = new OperationError(context, 400, originalError);

      // Should not throw
      expect(() => operationError.validate()).not.toThrow();
    });

    it('validates error structure matches schema', () => {
      const originalError: OriginalError = {
        code: 'DocumentNotFoundError',
        message: 'Profile not found',
        isCommonError: true
      };

      const operationError = new OperationError(context, 404, originalError);
      const validated = operationError.validate();

      expect(validated.error).toBeDefined();
      expect(validated.error.code).toBe('DocumentNotFoundError');
      expect(validated.error.message).toBe('Profile not found');
      expect(validated.error.statusCode).toBe(404);
    });

    it('validates error with validationErrors', () => {
      const validationErrors = [
        { path: 'email', message: 'Invalid format' }
      ] as any[];

      const originalError: OriginalError = {
        code: 'InvalidInputError',
        message: 'Validation failed',
        isCommonError: true,
        validationErrors
      };

      const operationError = new OperationError(context, 400, originalError);
      const validated = operationError.validate();

      expect(validated.error.validationErrors).toEqual(validationErrors);
    });
  });

  describe('edge cases', () => {
    it('handles error with missing code property', () => {
      const originalError: OriginalError = {
        message: 'Error without code',
        isCommonError: true
      };

      const operationError = new OperationError(context, 500, originalError);

      const error = operationError.attributes.error as Record<string, unknown>;
      expect(error.code).toBeUndefined();
    });

    it('handles error with empty message', () => {
      const originalError: OriginalError = {
        message: '',
        isCommonError: true
      };

      const operationError = new OperationError(context, 400, originalError);

      const error = operationError.attributes.error as { message: string };
      expect(error.message).toBe('');
    });

    it('handles various status codes', () => {
      const statusCodes = [400, 401, 403, 404, 422, 500];

      statusCodes.forEach(statusCode => {
        const originalError: OriginalError = {
          code: 'TestError',
          message: 'Test',
          isCommonError: true
        };

        const operationError = new OperationError(context, statusCode, originalError);

        const error = operationError.attributes.error as { statusCode: number };
        expect(error.statusCode).toBe(statusCode);

        if (statusCode === 500) {
          expect(mockedLogOperationError).toHaveBeenCalled();
        } else {
          // Clear mock for next iteration
          mockedLogOperationError.mockClear();
        }
      });
    });

    it('handles error with both validationErrors and unexpected error flag', () => {
      const validationErrors = [
        { path: 'field', message: 'Error' }
      ] as any[];

      const originalError: OriginalError = {
        code: 'SomeError',
        message: 'Error message',
        isCommonError: false, // Unexpected error
        validationErrors
      };

      const operationError = new OperationError(context, 500, originalError);

      // Should sanitize code/message but preserve validationErrors
      const error = operationError.attributes.error as { code: string; message: string; validationErrors?: unknown[] };
      expect(error.code).toBe('OperationError');
      expect(error.message).toBe('Unexpected operation error');
      expect(error.validationErrors).toEqual(validationErrors);
    });
  });

  describe('integration with logOperationError', () => {
    it('calls logOperationError with correct parameters for 500 errors', () => {
      const originalError: OriginalError = {
        code: 'InternalError',
        message: 'Internal server error',
        isCommonError: true,
        stack: 'Error stack trace'
      };

      new OperationError(context, 500, originalError);

      expect(mockedLogOperationError).toHaveBeenCalledTimes(1);
      const [loggedContext, errorAttributes, loggedOriginalError] = mockedLogOperationError.mock.calls[0];

      expect(loggedContext).toBe(context);
      expect(errorAttributes).toMatchObject({
        code: 'InternalError',
        message: 'Internal server error',
        statusCode: 500
      });
      expect(loggedOriginalError).toBe(originalError);
    });

    it('does not call logOperationError for non-500 status codes', () => {
      const statusCodes = [400, 401, 403, 404, 422];

      statusCodes.forEach(statusCode => {
        const originalError: OriginalError = {
          message: 'Error',
          isCommonError: true
        };

        new OperationError(context, statusCode, originalError);
      });

      expect(mockedLogOperationError).not.toHaveBeenCalled();
    });
  });
});
