import AccessDeniedError from '../AccessDeniedError';
import CommonError from '../CommonError';

describe('AccessDeniedError', () => {
  describe('constructor', () => {
    it('creates an instance with default message when no message is provided', () => {
      const err = new AccessDeniedError();

      expect(err.code).toBe('AccessDeniedError');
      expect(err.message).toBe('Operation access denied');
    });

    it('creates an instance with custom message when provided', () => {
      const customMessage = 'User does not have admin role';
      const err = new AccessDeniedError(customMessage);

      expect(err.code).toBe('AccessDeniedError');
      expect(err.message).toBe(customMessage);
    });

    it('accepts empty string as message', () => {
      const err = new AccessDeniedError('');

      expect(err.code).toBe('AccessDeniedError');
      expect(err.message).toBe('');
    });

    it('preserves message as Error.message for stack traces', () => {
      const message = 'User with roles [user] does not have access to CreateProfile';
      const err = new AccessDeniedError(message);

      expect(err.message).toBe(message);
    });
  });

  describe('code', () => {
    it('returns "AccessDeniedError"', () => {
      expect(new AccessDeniedError().code).toBe('AccessDeniedError');
      expect(new AccessDeniedError('Custom message').code).toBe('AccessDeniedError');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      expect(new AccessDeniedError().isCommonError).toBe(true);
      expect(new AccessDeniedError('Custom message').isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const accessDeniedErr = new AccessDeniedError('Access denied');
      const plainErr = new Error('Oops');

      expect(accessDeniedErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const err = new AccessDeniedError();
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(AccessDeniedError);
    });

    it('has a non-empty stack when thrown', () => {
      let err: AccessDeniedError | undefined;
      try {
        throw new AccessDeniedError('Access denied');
      } catch (e) {
        err = e as AccessDeniedError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Access denied');
      expect(err!.stack).toContain('AccessDeniedError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code and message when thrown and caught', () => {
      const message = 'User does not have required permissions';

      let caught: AccessDeniedError | undefined;
      try {
        throw new AccessDeniedError(message);
      } catch (e) {
        caught = e as AccessDeniedError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('AccessDeniedError');
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const message = 'Operation access denied, operation is available only for internal requests';

      let caught: CommonError | undefined;
      try {
        throw new AccessDeniedError(message);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('AccessDeniedError');
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const err = new AccessDeniedError();

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('AccessDeniedError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const err = new AccessDeniedError('Test message');

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('AccessDeniedError');
      expect(err.message).toBe('Test message');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with default message for JWT authorization failures', () => {
      const err = new AccessDeniedError();

      expect(err.code).toBe('AccessDeniedError');
      expect(err.message).toBe('Operation access denied');
      expect(err.isCommonError).toBe(true);
    });

    it('works with custom message for role-based access control', () => {
      const message = 'User with roles [user] does not have access to CreateProfile';
      const err = new AccessDeniedError(message);

      expect(err.code).toBe('AccessDeniedError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with custom message for system/internal-only operations', () => {
      const message = 'Operation access denied, operation is available only for internal requests';
      const err = new AccessDeniedError(message);

      expect(err.code).toBe('AccessDeniedError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with custom message for resource access checks', () => {
      const message = 'User 123 does not have access to resource 456';
      const err = new AccessDeniedError(message);

      expect(err.code).toBe('AccessDeniedError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });
  });
});
