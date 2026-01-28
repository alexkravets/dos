import UnauthorizedError from '../UnauthorizedError';
import CommonError from '../CommonError';

describe('UnauthorizedError', () => {
  describe('constructor', () => {
    it('creates an instance with provided message', () => {
      const message = 'Header "authorization" is missing';
      const err = new UnauthorizedError(message);

      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe(message);
    });

    it('requires a message parameter', () => {
      const message = 'Invalid authorization token';
      const err = new UnauthorizedError(message);

      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe(message);
    });

    it('accepts empty string as message', () => {
      const err = new UnauthorizedError('');

      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe('');
    });

    it('preserves message as Error.message for stack traces', () => {
      const message = 'Token expired';
      const err = new UnauthorizedError(message);

      expect(err.message).toBe(message);
    });
  });

  describe('code', () => {
    it('returns "UnauthorizedError"', () => {
      expect(new UnauthorizedError('Test message').code).toBe('UnauthorizedError');
      expect(new UnauthorizedError('Another message').code).toBe('UnauthorizedError');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      expect(new UnauthorizedError('Test').isCommonError).toBe(true);
      expect(new UnauthorizedError('Another message').isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const unauthorizedErr = new UnauthorizedError('Auth required');
      const plainErr = new Error('Oops');

      expect(unauthorizedErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const err = new UnauthorizedError('Test');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(UnauthorizedError);
    });

    it('has a non-empty stack when thrown', () => {
      const message = 'Authentication failed';
      let err: UnauthorizedError | undefined;
      try {
        throw new UnauthorizedError(message);
      } catch (e) {
        err = e as UnauthorizedError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain(message);
      expect(err!.stack).toContain('UnauthorizedError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code and message when thrown and caught', () => {
      const message = 'Header "authorization" is missing';

      let caught: UnauthorizedError | undefined;
      try {
        throw new UnauthorizedError(message);
      } catch (e) {
        caught = e as UnauthorizedError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('UnauthorizedError');
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const message = 'Invalid authorization token';

      let caught: CommonError | undefined;
      try {
        throw new UnauthorizedError(message);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('UnauthorizedError');
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const err = new UnauthorizedError('Test');

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('UnauthorizedError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const err = new UnauthorizedError('Test message');

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe('Test message');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with missing authentication credentials', () => {
      const message = 'Header "authorization" is missing';
      const err = new UnauthorizedError(message);

      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with invalid token format', () => {
      const message = 'Invalid authorization token';
      const err = new UnauthorizedError(message);

      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with token verification failures', () => {
      const message = 'Token expired';
      const err = new UnauthorizedError(message);

      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with invalid signature errors', () => {
      const message = 'Invalid signature';
      const err = new UnauthorizedError(message);

      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with wrong algorithm errors', () => {
      const message = 'Token algorithm mismatch';
      const err = new UnauthorizedError(message);

      expect(err.code).toBe('UnauthorizedError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });
  });
});
