import CommonError from './CommonError';

/**
 * Unprocessable Condition Error
 *
 * `UnprocessableConditionError` represents a **422 Unprocessable Entity** error that occurs
 * when an operation encounters an expected exit condition that prevents it from processing
 * the request. This error indicates that the request is well-formed and valid, but the
 * operation cannot proceed due to business logic constraints or state conditions.
 *
 * This error signals that:
 *
 * - The request syntax and structure are valid (input passes schema validation)
 * - The operation cannot be completed due to business rules or state constraints
 * - The condition is expected and part of normal operation flow (not a bug)
 *
 * This is distinct from other error types:
 * - **400 (InvalidInputError/InvalidParametersError)**: Input validation failures
 * - **404 (DocumentNotFoundError)**: Resource doesn't exist
 * - **500 (InvalidOutputError)**: Internal bugs
 *
 * The 422 status code indicates that the server understands the request but cannot process
 * it due to semantic errors or business logic constraints.
 */
class UnprocessableConditionError extends CommonError {
  /** Creates an instance of unprocessable condition error. */
  constructor(message: string = 'Unprocessable condition') {
    super('UnprocessableConditionError', message);
  }
}

export default UnprocessableConditionError;
