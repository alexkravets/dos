import UnprocessibleConditionError from '../UnprocessibleConditionError';
import CommonError from '../CommonError';

describe('UnprocessibleConditionError', () => {
  describe('constructor', () => {
    it('creates an instance with default message when no message is provided', () => {
      const err = new UnprocessibleConditionError();

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe('Unprocessible condition');
    });

    it('creates an instance with custom message when provided', () => {
      const customMessage = 'Order is already cancelled';
      const err = new UnprocessibleConditionError(customMessage);

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe(customMessage);
    });

    it('accepts empty string as message', () => {
      const err = new UnprocessibleConditionError('');

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe('');
    });

    it('preserves message as Error.message for stack traces', () => {
      const message = 'Account is already active';
      const err = new UnprocessibleConditionError(message);

      expect(err.message).toBe(message);
    });
  });

  describe('code', () => {
    it('returns "UnprocessibleConditionError"', () => {
      expect(new UnprocessibleConditionError().code).toBe('UnprocessibleConditionError');
      expect(new UnprocessibleConditionError('Custom message').code).toBe('UnprocessibleConditionError');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      expect(new UnprocessibleConditionError().isCommonError).toBe(true);
      expect(new UnprocessibleConditionError('Custom message').isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const unprocessibleErr = new UnprocessibleConditionError('Cannot process');
      const plainErr = new Error('Oops');

      expect(unprocessibleErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const err = new UnprocessibleConditionError();
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(UnprocessibleConditionError);
    });

    it('has a non-empty stack when thrown', () => {
      let err: UnprocessibleConditionError | undefined;
      try {
        throw new UnprocessibleConditionError('Cannot process');
      } catch (e) {
        err = e as UnprocessibleConditionError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Cannot process');
      expect(err!.stack).toContain('UnprocessibleConditionError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code and message when thrown and caught', () => {
      const message = 'Order is already cancelled';

      let caught: UnprocessibleConditionError | undefined;
      try {
        throw new UnprocessibleConditionError(message);
      } catch (e) {
        caught = e as UnprocessibleConditionError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('UnprocessibleConditionError');
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const message = 'Account is already active';

      let caught: CommonError | undefined;
      try {
        throw new UnprocessibleConditionError(message);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('UnprocessibleConditionError');
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const err = new UnprocessibleConditionError();

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const err = new UnprocessibleConditionError('Test message');

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe('Test message');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with default message for generic unprocessible conditions', () => {
      const err = new UnprocessibleConditionError();

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe('Unprocessible condition');
      expect(err.isCommonError).toBe(true);
    });

    it('works with business rule violations', () => {
      const message = 'Order is already cancelled';
      const err = new UnprocessibleConditionError(message);

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with state-dependent operations', () => {
      const message = 'Account is already active';
      const err = new UnprocessibleConditionError(message);

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with draft publication scenarios', () => {
      const message = 'Draft is missing required fields for publication';
      const err = new UnprocessibleConditionError(message);

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with resource constraints', () => {
      const message = 'Quota exceeded for this operation';
      const err = new UnprocessibleConditionError(message);

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });

    it('works with state transition errors', () => {
      const message = 'Cannot transition from current state to requested state';
      const err = new UnprocessibleConditionError(message);

      expect(err.code).toBe('UnprocessibleConditionError');
      expect(err.message).toBe(message);
      expect(err.isCommonError).toBe(true);
    });
  });
});
