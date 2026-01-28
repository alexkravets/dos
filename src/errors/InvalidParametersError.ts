import CommonError from './CommonError';

/**
 * Invalid Parameters Error
 *
 * ## Intent
 *
 * `InvalidParametersError` represents a **400 Bad Request** error that occurs when operation
 * parameters are syntactically correct (pass schema validation) but are semantically invalid or
 * not processible by the operation logic. This is distinct from `InvalidInputError`, which
 * indicates schema validation failures.
 *
 * This error signals that:
 *
 * - The input structure and types are valid according to the schema
 * - However, the parameter values are invalid for the specific operation context
 * - The operation cannot proceed with the provided parameters
 *
 * This error is typically thrown manually by operation implementations when they detect
 * invalid parameter combinations or values that cannot be validated by the schema alone.
 * For example, an operation might accept a date range where the start date must be before
 * the end date—this business rule cannot be expressed in JSON Schema, so the operation
 * would throw `InvalidParametersError` if violated.
 *
 * ## Use Cases
 *
 * 1. **Business rule validation**: When operation logic detects parameter values that violate
 *    business rules that cannot be expressed in JSON Schema (e.g., date ranges, dependent
 *    field validation, cross-field constraints).
 *
 * 2. **Semantic parameter validation**: When parameters are syntactically valid but semantically
 *    incorrect (e.g., a user ID that doesn't exist, a status value that's invalid for the
 *    current state, a reference that points to a deleted resource).
 *
 * 3. **Operation-specific constraints**: When an operation has constraints that are specific to
 *    its implementation and cannot be captured in the input schema (e.g., rate limits, resource
 *    availability, operation-specific business logic).
 *
 * 4. **Client error feedback**: Provides a way to return 400 errors with custom messages when
 *    schema validation passes but the operation cannot proceed due to invalid parameter values.
 */
class InvalidParametersError extends CommonError {
  /**
   * Creates an instance of invalid parameters error.
   *
   * @param message - Human-readable error message describing why the parameters are invalid.
   *                  Defaults to 'Invalid parameters' if not provided. Should describe the
   *                  specific issue with the parameters (e.g., 'Start date must be before end date',
   *                  'User ID does not exist').
   */
  constructor(message: string = 'Invalid parameters') {
    super('InvalidParametersError', message);
  }
}

export default InvalidParametersError;
