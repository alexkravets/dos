import { CommonError } from '../../Operation';
import { ValidationError, type ValidationErrorOutput } from '@kravc/schema';

/**
 * Invalid Input Error
 *
 * `InvalidInputError` represents a **400 Bad Request** error that occurs when operation
 * input fails schema validation. This error is thrown automatically by `Service.process()`
 * when the input parameters (query parameters and mutation body) do not conform to the
 * operation's `inputSchema` specification.
 *
 * This error signals that:
 *
 * - The request input structure or values violate the operation's input schema
 * - The client should review the validation errors to understand which fields failed
 * - The operation cannot proceed until valid input is provided
 *
 * The error includes detailed validation errors that specify which fields failed validation,
 * why they failed, and what the expected format should be. This allows clients to provide
 * user-friendly validation feedback and fix input issues without guessing.
 */
class InvalidInputError extends CommonError {
  private _validationErrors: ValidationErrorOutput[];

  /** Creates an instance of invalid input error. */
  constructor(validationError: ValidationError) {
    super('InvalidInputError', 'Invalid operation input');

    const { validationErrors } = validationError.toJSON();

    this._validationErrors = validationErrors;
  }

  /** Returns the array of validation errors describing which fields failed validation. */
  get validationErrors() {
    return this._validationErrors;
  }
}

export default InvalidInputError;
