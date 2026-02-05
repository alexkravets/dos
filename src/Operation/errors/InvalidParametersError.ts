import CommonError from './CommonError';

/**
 * Invalid Parameters Error
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
 */
class InvalidParametersError extends CommonError {
  /** Creates an instance of invalid parameters error. */
  constructor(message: string = 'Invalid parameters') {
    super('InvalidParametersError', message);
  }
}

export default InvalidParametersError;
