import InvalidParametersError from '../InvalidParametersError';
import CommonError from '../CommonError';

describe('InvalidParametersError', () => {
  describe('constructor', () => {
    it('creates an instance with default message when no message is provided', () => {
      const err = new InvalidParametersError();

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe('Invalid parameters');
    });

    it('creates an instance with custom message when provided', () => {
      const customMessage = 'Start date must be before end date';
      const err = new InvalidParametersError(customMessage);

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe(customMessage);
    });

    it('accepts empty string as message', () => {
      const err = new InvalidParametersError('');

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe('');
    });

    it('preserves message as Error.message for stack traces', () => {
      const message = 'User ID does not exist';
      const err = new InvalidParametersError(message);

      expect(err.message).toBe(message);
    });
  });

  describe('code', () => {
    it('returns "InvalidParametersError"', () => {
      expect(new InvalidParametersError().code).toBe('InvalidParametersError');
      expect(new InvalidParametersError('Custom message').code).toBe('InvalidParametersError');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      expect(new InvalidParametersError().isCommonError).toBe(true);
      expect(new InvalidParametersError('Custom message').isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const invalidParamsErr = new InvalidParametersError('Invalid params');
      const plainErr = new Error('Oops');

      expect(invalidParamsErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const err = new InvalidParametersError();
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(InvalidParametersError);
    });

    it('has a non-empty stack when thrown', () => {
      let err: InvalidParametersError | undefined;
      try {
        throw new InvalidParametersError('Invalid parameters');
      } catch (e) {
        err = e as InvalidParametersError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Invalid parameters');
      expect(err!.stack).toContain('InvalidParametersError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code and message when thrown and caught', () => {
      const message = 'Date range is invalid';

      let caught: InvalidParametersError | undefined;
      try {
        throw new InvalidParametersError(message);
      } catch (e) {
        caught = e as InvalidParametersError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('InvalidParametersError');
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const message = 'User ID does not exist';

      let caught: CommonError | undefined;
      try {
        throw new InvalidParametersError(message);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('InvalidParametersError');
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const err = new InvalidParametersError();

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('InvalidParametersError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const err = new InvalidParametersError('Test message');

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe('Test message');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with default message for generic parameter validation', () => {
      const err = new InvalidParametersError();

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe('Invalid parameters');
      expect(err.isCommonError).toBe(true);
    });

    it('works with custom message for business rule violations', () => {
      const message = 'Start date must be before end date';
      const err = new InvalidParametersError(message);

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with custom message for semantic validation', () => {
      const message = 'User ID does not exist';
      const err = new InvalidParametersError(message);

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with custom message for operation-specific constraints', () => {
      const message = 'Rate limit exceeded for this operation';
      const err = new InvalidParametersError(message);

      expect(err.code).toBe('InvalidParametersError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });
  });
});
