import InvalidInputError from '../InvalidInputError';
import CommonError from '../CommonError';
import { type ValidationErrorOutput } from '@kravc/schema';

// Mock ValidationError class
/**
 *
 */
class MockValidationError {
  private _validationErrors: ValidationErrorOutput[];

  /**
   *
   */
  constructor(validationErrors: ValidationErrorOutput[]) {
    this._validationErrors = validationErrors;
  }

  /**
   *
   */
  toJSON() {
    return {
      validationErrors: this._validationErrors
    };
  }
}

describe('InvalidInputError', () => {
  describe('constructor', () => {
    it('creates an instance with validation errors from ValidationError', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'email', message: 'Invalid email format', code: 'format' },
        { path: 'age', message: 'Must be a number', code: 'type' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidInputError(validationError);

      expect(err.code).toBe('InvalidInputError');
      expect(err.message).toBe('Invalid operation input');
      expect(err.validationErrors).toEqual(validationErrors);
    });

    it('handles empty validation errors array', () => {
      const validationError = new MockValidationError([]) as any;
      const err = new InvalidInputError(validationError);

      expect(err.code).toBe('InvalidInputError');
      expect(err.message).toBe('Invalid operation input');
      expect(err.validationErrors).toEqual([]);
    });

    it('handles validation errors with schemaId', () => {
      const validationErrors: ValidationErrorOutput[] = [
        {
          path: 'user.profile.name',
          message: 'Name is required',
          code: 'required',
          schemaId: 'ProfileSchema'
        }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidInputError(validationError);

      expect(err.validationErrors).toEqual(validationErrors);
      expect(err.validationErrors[0]).toHaveProperty('schemaId', 'ProfileSchema');
    });

    it('extracts validation errors from ValidationError.toJSON()', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'field1', message: 'Error 1', code: 'custom' },
        { path: 'field2', message: 'Error 2', code: 'custom' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidInputError(validationError);

      expect(err.validationErrors).toHaveLength(2);
      expect(err.validationErrors[0].path).toBe('field1');
      expect(err.validationErrors[1].path).toBe('field2');
    });
  });

  describe('code', () => {
    it('returns "InvalidInputError"', () => {
      const validationError = new MockValidationError([]) as any;
      expect(new InvalidInputError(validationError).code).toBe('InvalidInputError');
    });
  });

  describe('message', () => {
    it('returns "Invalid operation input"', () => {
      const validationError = new MockValidationError([]) as any;
      expect(new InvalidInputError(validationError).message).toBe('Invalid operation input');
    });
  });

  describe('validationErrors', () => {
    it('returns the validation errors array', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'email', message: 'Invalid email', code: 'format' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidInputError(validationError);

      expect(err.validationErrors).toBe(validationErrors);
      expect(err.validationErrors).toHaveLength(1);
    });

    it('returns validation errors with all properties', () => {
      const validationErrors: ValidationErrorOutput[] = [
        {
          path: 'user.email',
          message: 'Invalid email format',
          code: 'format',
          schemaId: 'CreateUserInput'
        }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidInputError(validationError);

      const error = err.validationErrors[0];
      expect(error.path).toBe('user.email');
      expect(error.message).toBe('Invalid email format');
      expect(error.code).toBe('format');
      expect(error.schemaId).toBe('CreateUserInput');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      const validationError = new MockValidationError([]) as any;
      expect(new InvalidInputError(validationError).isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const validationError = new MockValidationError([]) as any;
      const invalidInputErr = new InvalidInputError(validationError);
      const plainErr = new Error('Oops');

      expect(invalidInputErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const validationError = new MockValidationError([]) as any;
      const err = new InvalidInputError(validationError);
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(InvalidInputError);
    });

    it('has a non-empty stack when thrown', () => {
      const validationError = new MockValidationError([]) as any;
      let err: InvalidInputError | undefined;
      try {
        throw new InvalidInputError(validationError);
      } catch (e) {
        err = e as InvalidInputError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Invalid operation input');
      expect(err!.stack).toContain('InvalidInputError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code, message, and validationErrors when thrown and caught', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'email', message: 'Invalid email', code: 'format' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;

      let caught: InvalidInputError | undefined;
      try {
        throw new InvalidInputError(validationError);
      } catch (e) {
        caught = e as InvalidInputError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('InvalidInputError');
      expect(caught!.message).toBe('Invalid operation input');
      expect(caught!.validationErrors).toEqual(validationErrors);
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const validationError = new MockValidationError([]) as any;

      let caught: CommonError | undefined;
      try {
        throw new InvalidInputError(validationError);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('InvalidInputError');
      expect(caught!.message).toBe('Invalid operation input');
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const validationError = new MockValidationError([]) as any;
      const err = new InvalidInputError(validationError);

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('InvalidInputError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const validationError = new MockValidationError([]) as any;
      const err = new InvalidInputError(validationError);

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('validationErrors');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('InvalidInputError');
      expect(err.message).toBe('Invalid operation input');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with single validation error', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'email', message: 'Invalid email format', code: 'format' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidInputError(validationError);

      expect(err.code).toBe('InvalidInputError');
      expect(err.validationErrors).toHaveLength(1);
      expect(err.validationErrors[0].path).toBe('email');
    });

    it('works with multiple validation errors', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'email', message: 'Invalid email format', code: 'format' },
        { path: 'age', message: 'Must be a number', code: 'type' },
        { path: 'name', message: 'Name is required', code: 'required' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidInputError(validationError);

      expect(err.validationErrors).toHaveLength(3);
      expect(err.validationErrors.map(e => e.path)).toEqual(['email', 'age', 'name']);
    });

    it('works with nested path validation errors', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'user.profile.email', message: 'Invalid email', code: 'format' },
        { path: 'user.profile.age', message: 'Must be positive', code: 'minimum' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidInputError(validationError);

      expect(err.validationErrors).toHaveLength(2);
      expect(err.validationErrors[0].path).toBe('user.profile.email');
      expect(err.validationErrors[1].path).toBe('user.profile.age');
    });
  });
});
