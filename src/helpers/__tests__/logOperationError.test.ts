import logOperationError, { type ErrorAttributes, type OriginalError } from '../logOperationError';
import { Context } from '../../Context';
import { ValidationError } from '@kravc/schema';

// Mock dependencies
jest.mock('@kravc/schema', () => {
  const actual = jest.requireActual('@kravc/schema');
  return {
    ...actual,
    // eslint-disable-next-line jsdoc/require-jsdoc
    ValidationError: class MockValidationError {}
  };
});


describe('logOperationError', () => {
  let mockLogger: { error: jest.Mock };
  let context: Context;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn()
    };

    context = {
      logger: mockLogger,
      validator: {} as any
    };
  });


  describe('context extraction and masking', () => {
    it('extracts and masks secrets from context fields', () => {
      const fullContext = {
        ...context,
        query: { id: '123', password: 'secret123' },
        mutation: { name: 'Test', token: 'jwt-token' },
        identity: { userId: 'u1', authorization: 'Bearer xyz' },
        requestId: 'req_abc',
        operationId: 'ReadProfile',
        requestReceivedAt: new Date('2026-01-28T10:00:00Z'),
        extraField: 'should not be included'
      };

      const errorAttributes: ErrorAttributes = {
        code: 'DocumentNotFoundError',
        message: 'Profile not found',
        statusCode: 404,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Profile not found',
        isCommonError: true
      };

      logOperationError(fullContext, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('OperationError');
      
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      expect(logMatch).toBeTruthy();
      
      const loggedData = JSON.parse(logMatch![1]);
      expect(loggedData.context).toEqual({
        query: { id: '123', password: '[MASKED]' },
        mutation: { name: 'Test', token: '[MASKED]' },
        identity: { userId: 'u1', authorization: '[MASKED]' },
        requestId: 'req_abc',
        operationId: 'ReadProfile',
        requestReceivedAt: '2026-01-28T10:00:00.000Z'
      });
      expect(loggedData.context).not.toHaveProperty('extraField');
    });

    it('handles missing context fields gracefully', () => {
      const minimalContext = {
        ...context,
        requestId: 'req_xyz'
      };

      const errorAttributes: ErrorAttributes = {
        code: 'InvalidInputError',
        message: 'Validation failed',
        statusCode: 400,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Validation failed',
        isCommonError: true
      };

      logOperationError(minimalContext, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      const loggedData = JSON.parse(logMatch![1]);
      
      expect(loggedData.context).toEqual({
        requestId: 'req_xyz'
      });
    });

    it('handles empty context', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'OperationError',
        message: 'Unexpected error',
        statusCode: 500,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Something went wrong',
        isCommonError: false,
        stack: 'Error: Something went wrong\n    at test.js:1:1'
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      const loggedData = JSON.parse(logMatch![1]);
      
      expect(loggedData.context).toEqual({});
    });
  });

  describe('common error handling', () => {
    it('includes originalError when isCommonError is true', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'DocumentNotFoundError',
        message: 'Profile not found',
        statusCode: 404,
        context: {}
      };

      const originalError: OriginalError = {
        code: 'DocumentNotFoundError',
        message: 'Profile not found',
        isCommonError: true
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      const loggedData = JSON.parse(logMatch![1]);
      
      expect(loggedData.originalError).toEqual({
        code: 'DocumentNotFoundError',
        message: 'Profile not found',
        isCommonError: true
      });
      expect(logCall).not.toContain('Unexpected');
    });

    it('includes validationErrors in originalError when present', () => {
      const validationErrors = [
        { path: 'email', message: 'Invalid email format' } as unknown as ValidationError,
        { path: 'age', message: 'Must be a number' } as unknown as ValidationError
      ];

      const errorAttributes: ErrorAttributes = {
        code: 'InvalidInputError',
        message: 'Validation failed',
        statusCode: 400,
        validationErrors,
        context: {}
      };

      const originalError: OriginalError = {
        code: 'InvalidInputError',
        message: 'Validation failed',
        isCommonError: true,
        validationErrors
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      const loggedData = JSON.parse(logMatch![1]);
      
      expect(loggedData.validationErrors).toEqual(validationErrors);
      expect(loggedData.originalError.validationErrors).toEqual(validationErrors);
    });
  });

  describe('unexpected error handling', () => {
    it('appends stack trace when isCommonError is false', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'OperationError',
        message: 'Unexpected operation error',
        statusCode: 500,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Cannot read property "id" of undefined',
        stack: 'Error: Cannot read property "id" of undefined\n    at test.js:10:5\n    at Object.<anonymous> (test.js:15:2)'
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('Unexpected');
      expect(logCall).toContain('Cannot read property "id" of undefined');
      expect(logCall).toContain('at test.js:10:5');
      
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*}),\s+Unexpected\s+(.+)/);
      expect(logMatch).toBeTruthy();
      expect(logMatch![2]).toContain('Error: Cannot read property "id" of undefined');
    });

    it('handles missing stack trace gracefully', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'OperationError',
        message: 'Unexpected operation error',
        statusCode: 500,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Something went wrong'
        // stack is undefined
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('Unexpected');
      expect(logCall).toContain('undefined');
    });

    it('does not include originalError when isCommonError is false', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'OperationError',
        message: 'Unexpected operation error',
        statusCode: 500,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Unexpected error',
        stack: 'Error: Unexpected error'
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      const loggedData = JSON.parse(logMatch![1]);
      
      expect(loggedData.originalError).toBeUndefined();
    });
  });

  describe('log format', () => {
    it('formats error attributes as JSON with 2-space indentation', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'TestError',
        message: 'Test message',
        statusCode: 500,
        context: { requestId: 'req_123' }
      };

      const originalError: OriginalError = {
        message: 'Test message',
        isCommonError: true
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      
      // Check that it starts with "OperationError "
      expect(logCall).toMatch(/^OperationError\s+/);
      
      // Check that the JSON is properly formatted (contains newlines for 2-space indentation)
      const jsonMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      expect(jsonMatch).toBeTruthy();
      
      const parsed = JSON.parse(jsonMatch![1]);
      expect(parsed.code).toBe('TestError');
      expect(parsed.message).toBe('Test message');
      expect(parsed.statusCode).toBe(500);
    });

    it('includes all error attribute fields in the log', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'CompleteError',
        message: 'Complete error message',
        statusCode: 422,
        validationErrors: [{ path: 'field', message: 'Error' }] as unknown as ValidationError[],
        context: { requestId: 'req_complete' }
      };

      const originalError: OriginalError = {
        code: 'CompleteError',
        message: 'Complete error message',
        isCommonError: true,
        validationErrors: [{ path: 'field', message: 'Error' }] as unknown as ValidationError[]
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      const loggedData = JSON.parse(logMatch![1]);
      
      expect(loggedData).toHaveProperty('code');
      expect(loggedData).toHaveProperty('message');
      expect(loggedData).toHaveProperty('statusCode');
      expect(loggedData).toHaveProperty('context');
      expect(loggedData).toHaveProperty('validationErrors');
      expect(loggedData).toHaveProperty('originalError');
    });
  });

  describe('mutates errorAttributes', () => {
    it('mutates errorAttributes.context with masked context', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'TestError',
        message: 'Test',
        statusCode: 500,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Test',
        isCommonError: true
      };

      const contextWithSecrets = {
        ...context,
        query: { password: 'secret' },
        requestId: 'req_1'
      };

      logOperationError(contextWithSecrets, errorAttributes, originalError);

      // Verify that errorAttributes.context was mutated
      expect(errorAttributes.context).toEqual({
        query: { password: '[MASKED]' },
        requestId: 'req_1'
      });
    });
  });

  describe('edge cases', () => {
    it('handles context with nested objects containing secrets', () => {
      const contextWithNestedSecrets = {
        ...context,
        query: {
          user: { id: '123', password: 'secret', token: 'jwt' },
          filters: { code: 'abc' }
        },
        requestId: 'req_nested'
      };

      const errorAttributes: ErrorAttributes = {
        code: 'TestError',
        message: 'Test',
        statusCode: 500,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Test',
        isCommonError: true
      };

      logOperationError(contextWithNestedSecrets, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      const loggedData = JSON.parse(logMatch![1]);
      
      expect(loggedData.context.query.user.password).toBe('[MASKED]');
      expect(loggedData.context.query.user.token).toBe('[MASKED]');
      expect(loggedData.context.query.filters.code).toBe('[MASKED]');
      expect(loggedData.context.query.user.id).toBe('123');
    });

    it('handles isCommonError as undefined (treats as unexpected)', () => {
      const errorAttributes: ErrorAttributes = {
        code: 'OperationError',
        message: 'Unexpected error',
        statusCode: 500,
        context: {}
      };

      const originalError: OriginalError = {
        message: 'Error',
        stack: 'Error: Error\n    at test.js:1:1'
        // isCommonError is undefined
      };

      logOperationError(context, errorAttributes, originalError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const logCall = (mockLogger.error as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('Unexpected');
      const logMatch = logCall.match(/OperationError\s+({[\s\S]*})/);
      const loggedData = JSON.parse(logMatch![1]);
      expect(loggedData.originalError).toBeUndefined();
    });
  });
});
