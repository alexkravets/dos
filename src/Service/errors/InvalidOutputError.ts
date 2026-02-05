import { CommonError } from '../../Operation';
import { ValidationError, type ValidationErrorOutput } from '@kravc/schema';

/**
 * Invalid Output Error
 *
 * `InvalidOutputError` represents a **500 Internal Server Error** that occurs when an operation's
 * return value fails schema validation against its `outputSchema`. This error indicates a **bug**
 * in the operation implementation, as the operation returned data that doesn't match its declared
 * output schema specification.
 *
 * This error signals that:
 *
 * - The operation's `exec()` method returned data that violates the operation's `outputSchema`
 * - This is an internal error that should be fixed by the service developer, not the client
 * - The operation's implementation is inconsistent with its API contract
 *
 * Unlike `InvalidInputError` (400), which indicates client error, `InvalidOutputError` (500)
 * indicates a server-side bug. The error is automatically logged with full context via
 * `logOperationError()` to help developers identify and fix the issue.
 */
class InvalidOutputError extends CommonError {
  private _validationErrors: ValidationErrorOutput[];

  /** Creates an instance of invalid output error. */
  constructor(validationError: ValidationError) {
    super('InvalidOutputError', 'Invalid operation output');

    const { validationErrors } = validationError.toJSON();

    this._validationErrors = validationErrors;
  }

  /** Returns the array of validation errors describing which fields in the output failed validation. */
  get validationErrors() {
    return this._validationErrors;
  }
}

export default InvalidOutputError;
