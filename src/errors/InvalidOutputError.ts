import CommonError from './CommonError';
import { ValidationError, type ValidationErrorOutput } from '@kravc/schema';

/**
 * Invalid Output Error
 *
 * ## Intent
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
 *
 * ## Use Cases
 *
 * 1. **Output validation enforcement**: Thrown by `Service._getOutput()` when `Validator.validate()`
 *    fails during output schema validation. This happens after the operation's `exec()` method
 *    completes, ensuring all operation outputs conform to their declared schemas.
 *
 * 2. **API contract verification**: Ensures that operation implementations match their OpenAPI
 *    specifications. If an operation declares an `outputSchema`, it must return data that
 *    conforms to that schema, or this error is thrown.
 *
 * 3. **Development debugging**: Validation errors provide detailed information about which fields
 *    in the output don't match the schema, helping developers identify bugs in operation logic
 *    or schema mismatches.
 *
 * 4. **Production error logging**: Since this indicates a bug, the error is automatically logged
 *    with full context (request ID, operation ID, parameters, identity) via `logOperationError()`
 *    when the status code is 500, enabling production debugging.
 */
class InvalidOutputError extends CommonError {
  private _validationErrors: ValidationErrorOutput[];

  /**
   * Creates an instance of invalid output error.
   *
   * @param validationError - The `ValidationError` instance from `@kravc/schema` validator
   *                          that contains validation failure details. The error's `toJSON()`
   *                          method is called to extract the `validationErrors` array.
   */
  constructor(validationError: ValidationError) {
    super('InvalidOutputError', 'Invalid operation output');

    const { validationErrors } = validationError.toJSON();

    this._validationErrors = validationErrors;
  }

  /**
   * Returns the array of validation errors describing which fields in the output failed validation.
   *
   * Each error object contains:
   * - `path`: The JSON path to the invalid field (e.g., 'data.id', 'headers.contentType')
   * - `message`: Human-readable error message describing the validation failure
   * - `code`: Error code indicating the type of validation failure (e.g., 'format', 'type', 'required')
   * - `schemaId`: Optional schema identifier that was being validated against
   *
   * @returns Array of validation error objects
   */
  get validationErrors() {
    return this._validationErrors;
  }
}

export default InvalidOutputError;
