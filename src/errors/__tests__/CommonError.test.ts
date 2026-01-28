import CommonError from '../CommonError';

describe('CommonError', () => {
  describe('constructor', () => {
    it('creates an instance with the given code and message', () => {
      const err = new CommonError('TestError', 'Something went wrong');

      expect(err.code).toBe('TestError');
      expect(err.message).toBe('Something went wrong');
    });

    it('accepts empty strings for code and message', () => {
      const err = new CommonError('', '');

      expect(err.code).toBe('');
      expect(err.message).toBe('');
    });

    it('preserves message as Error.message for stack traces', () => {
      const err = new CommonError('ValidationError', 'Invalid email format');

      expect(err.message).toBe('Invalid email format');
    });
  });

  describe('code', () => {
    it('returns the code passed to the constructor', () => {
      expect(new CommonError('DocumentNotFoundError', 'Not found').code).toBe('DocumentNotFoundError');
      expect(new CommonError('InvalidInputError', 'Bad input').code).toBe('InvalidInputError');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      expect(new CommonError('AnyCode', 'Any message').isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const commonErr = new CommonError('UnauthorizedError', 'Auth required');
      const plainErr = new Error('Oops');

      expect(commonErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const err = new CommonError('X', 'Y');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
    });

    it('has a non-empty stack when thrown', () => {
      let err: CommonError | undefined;
      try {
        throw new CommonError('StackTest', 'Stack trace');
      } catch (e) {
        err = e as CommonError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Stack trace');
      expect(err!.stack).toContain('CommonError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code and message when thrown and caught', () => {
      const code = 'DocumentNotFoundError';
      const message = 'Profile not found {"id": "123"}';

      let caught: CommonError | undefined;
      try {
        throw new CommonError(code, message);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe(code);
      expect(caught!.message).toBe(message);
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('subclassing', () => {
    it('subclass inherits code, message, and isCommonError', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class CustomError extends CommonError {
        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor(msg: string) {
          super('CustomError', msg);
        }
      }

      const err = new CustomError('Custom failure');

      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe('CustomError');
      expect(err.message).toBe('Custom failure');
      expect(err.isCommonError).toBe(true);
    });

    it('subclass can be thrown and caught as CommonError', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      class SubError extends CommonError {
        // eslint-disable-next-line jsdoc/require-jsdoc
        constructor() {
          super('SubError', 'Sub message');
        }
      }

      let caught: CommonError | undefined;
      try {
        throw new SubError();
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('SubError');
      expect(caught!.message).toBe('Sub message');
    });
  });
});
