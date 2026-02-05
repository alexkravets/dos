import InvalidOutputError from '../InvalidOutputError';
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

describe('InvalidOutputError', () => {
  describe('constructor', () => {
    it('creates an instance with validation errors from ValidationError', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'data.id', message: 'ID is required', code: 'required' },
        { path: 'data.email', message: 'Invalid email format', code: 'format' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidOutputError(validationError);

      expect(err.code).toBe('InvalidOutputError');
      expect(err.message).toBe('Invalid operation output');
      expect(err.validationErrors).toEqual(validationErrors);
    });

    it('handles empty validation errors array', () => {
      const validationError = new MockValidationError([]) as any;
      const err = new InvalidOutputError(validationError);

      expect(err.code).toBe('InvalidOutputError');
      expect(err.message).toBe('Invalid operation output');
      expect(err.validationErrors).toEqual([]);
    });

    it('handles validation errors with schemaId', () => {
      const validationErrors: ValidationErrorOutput[] = [
        {
          path: 'data.profile',
          message: 'Profile does not match schema',
          code: 'type',
          schemaId: 'ProfileOutput'
        }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidOutputError(validationError);

      expect(err.validationErrors).toEqual(validationErrors);
      expect(err.validationErrors[0]).toHaveProperty('schemaId', 'ProfileOutput');
    });

    it('extracts validation errors from ValidationError.toJSON()', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'output.field1', message: 'Error 1', code: 'custom' },
        { path: 'output.field2', message: 'Error 2', code: 'custom' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidOutputError(validationError);

      expect(err.validationErrors).toHaveLength(2);
      expect(err.validationErrors[0].path).toBe('output.field1');
      expect(err.validationErrors[1].path).toBe('output.field2');
    });
  });

  describe('code', () => {
    it('returns "InvalidOutputError"', () => {
      const validationError = new MockValidationError([]) as any;
      expect(new InvalidOutputError(validationError).code).toBe('InvalidOutputError');
    });
  });

  describe('message', () => {
    it('returns "Invalid operation output"', () => {
      const validationError = new MockValidationError([]) as any;
      expect(new InvalidOutputError(validationError).message).toBe('Invalid operation output');
    });
  });

  describe('validationErrors', () => {
    it('returns the validation errors array', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'data.id', message: 'ID is required', code: 'required' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidOutputError(validationError);

      expect(err.validationErrors).toBe(validationErrors);
      expect(err.validationErrors).toHaveLength(1);
    });

    it('returns validation errors with all properties', () => {
      const validationErrors: ValidationErrorOutput[] = [
        {
          path: 'data.user.email',
          message: 'Invalid email format',
          code: 'format',
          schemaId: 'UserOutput'
        }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidOutputError(validationError);

      const error = err.validationErrors[0];
      expect(error.path).toBe('data.user.email');
      expect(error.message).toBe('Invalid email format');
      expect(error.code).toBe('format');
      expect(error.schemaId).toBe('UserOutput');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      const validationError = new MockValidationError([]) as any;
      expect(new InvalidOutputError(validationError).isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const validationError = new MockValidationError([]) as any;
      const invalidOutputErr = new InvalidOutputError(validationError);
      const plainErr = new Error('Oops');

      expect(invalidOutputErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const validationError = new MockValidationError([]) as any;
      const err = new InvalidOutputError(validationError);
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(InvalidOutputError);
    });

    it('has a non-empty stack when thrown', () => {
      const validationError = new MockValidationError([]) as any;
      let err: InvalidOutputError | undefined;
      try {
        throw new InvalidOutputError(validationError);
      } catch (e) {
        err = e as InvalidOutputError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Invalid operation output');
      expect(err!.stack).toContain('InvalidOutputError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code, message, and validationErrors when thrown and caught', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'data.id', message: 'ID is required', code: 'required' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;

      let caught: InvalidOutputError | undefined;
      try {
        throw new InvalidOutputError(validationError);
      } catch (e) {
        caught = e as InvalidOutputError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('InvalidOutputError');
      expect(caught!.message).toBe('Invalid operation output');
      expect(caught!.validationErrors).toEqual(validationErrors);
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const validationError = new MockValidationError([]) as any;

      let caught: CommonError | undefined;
      try {
        throw new InvalidOutputError(validationError);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('InvalidOutputError');
      expect(caught!.message).toBe('Invalid operation output');
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const validationError = new MockValidationError([]) as any;
      const err = new InvalidOutputError(validationError);

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('InvalidOutputError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const validationError = new MockValidationError([]) as any;
      const err = new InvalidOutputError(validationError);

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('validationErrors');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('InvalidOutputError');
      expect(err.message).toBe('Invalid operation output');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with single validation error', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'data.id', message: 'ID is required', code: 'required' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidOutputError(validationError);

      expect(err.code).toBe('InvalidOutputError');
      expect(err.validationErrors).toHaveLength(1);
      expect(err.validationErrors[0].path).toBe('data.id');
    });

    it('works with multiple validation errors', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'data.id', message: 'ID is required', code: 'required' },
        { path: 'data.email', message: 'Invalid email format', code: 'format' },
        { path: 'headers.contentType', message: 'Content-Type is required', code: 'required' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidOutputError(validationError);

      expect(err.validationErrors).toHaveLength(3);
      expect(err.validationErrors.map(e => e.path)).toEqual([
        'data.id',
        'data.email',
        'headers.contentType'
      ]);
    });

    it('works with nested path validation errors', () => {
      const validationErrors: ValidationErrorOutput[] = [
        { path: 'data.user.profile.email', message: 'Invalid email', code: 'format' },
        { path: 'data.user.profile.age', message: 'Must be positive', code: 'minimum' }
      ];
      const validationError = new MockValidationError(validationErrors) as any;
      const err = new InvalidOutputError(validationError);

      expect(err.validationErrors).toHaveLength(2);
      expect(err.validationErrors[0].path).toBe('data.user.profile.email');
      expect(err.validationErrors[1].path).toBe('data.user.profile.age');
    });
  });
});
