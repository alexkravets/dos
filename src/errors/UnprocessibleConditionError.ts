import CommonError from './CommonError';

/**
 * Unprocessible Condition Error
 *
 * ## Intent
 *
 * `UnprocessibleConditionError` represents a **422 Unprocessable Entity** error that occurs
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
 *
 * ## Use Cases
 *
 * 1. **Business rule violations**: When an operation cannot proceed due to business logic
 *    constraints that are expected conditions (e.g., attempting to cancel an already cancelled
 *    order, trying to activate an account that's already active, processing a payment for an
 *    order that's already paid).
 *
 * 2. **State-dependent operations**: When an operation requires a specific state that isn't
 *    currently met (e.g., trying to publish a draft that's missing required fields, attempting
 *    to transition to a state that's not allowed from the current state).
 *
 * 3. **Resource constraints**: When an operation cannot proceed due to resource limitations
 *    or constraints that are part of normal operation (e.g., quota exceeded, rate limit reached,
 *    capacity full—though these might also use 429 Too Many Requests).
 *
 * 4. **Expected failure conditions**: When an operation explicitly checks for and handles
 *    conditions that prevent processing, as opposed to unexpected errors or bugs. This allows
 *    clients to distinguish between "cannot process due to expected condition" (422) and
 *    "unexpected error occurred" (500).
 */
class UnprocessibleConditionError extends CommonError {
  /**
   * Creates an instance of unprocessible condition error.
   *
   * @param message - Human-readable error message describing why the operation cannot be processed.
   *                  Defaults to 'Unprocessible condition' if not provided. Should describe the specific
   *                  condition that prevents processing (e.g., 'Order is already cancelled',
   *                  'Account is already active', 'Draft is missing required fields for publication').
   */
  constructor(message: string = 'Unprocessible condition') {
    super('UnprocessibleConditionError', message);
  }
}

export default UnprocessibleConditionError;
