import CommonError from './CommonError';
import { ValidationError, type ValidationErrorOutput } from '@kravc/schema';

/**
 * Invalid Input Error
 *
 * ## Intent
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
 *
 * ## Use Cases
 *
 * 1. **Automatic input validation**: Thrown by `Service._getParameters()` when `Validator.validate()`
 *    fails during input schema validation. This happens before the operation's `exec()` method
 *    is called, ensuring invalid input never reaches business logic.
 *
 * 2. **Client-side error handling**: Clients can check for `InvalidInputError` (code: 'InvalidInputError',
 *    statusCode: 400) and display the `validationErrors` array to show users which fields need
 *    correction. Each validation error includes `path`, `message`, `code`, and optionally `schemaId`.
 *
 * 3. **API contract enforcement**: Ensures that all operation inputs conform to the OpenAPI specification
 *    defined in the `inputSchema`, maintaining API consistency and preventing invalid data from
 *    entering the system.
 *
 * 4. **Development debugging**: Validation errors provide detailed information about schema mismatches,
 *    helping developers understand why input was rejected and how to fix it.
 */
class InvalidInputError extends CommonError {
  private _validationErrors: ValidationErrorOutput[];

  /**
   * Creates an instance of invalid input error.
   *
   * @param validationError - The `ValidationError` instance from `@kravc/schema` validator
   *                          that contains validation failure details. The error's `toJSON()`
   *                          method is called to extract the `validationErrors` array.
   */
  constructor(validationError: ValidationError) {
    super('InvalidInputError', 'Invalid operation input');

    const { validationErrors } = validationError.toJSON();

    this._validationErrors = validationErrors;
  }

  /**
   * Returns the array of validation errors describing which fields failed validation.
   *
   * Each error object contains:
   * - `path`: The JSON path to the invalid field (e.g., 'email', 'user.profile.age')
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

export default InvalidInputError;
