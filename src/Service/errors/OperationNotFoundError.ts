import { CommonError } from '../../Operation';

/**
 * Operation Not Found Error
 *
 * `OperationNotFoundError` represents a **404 Not Found** error that occurs when a requested
 * operation cannot be found in the service. This error is thrown by `Service.process()` when
 * no operation matches the provided `operationId`, `httpMethod`, and `httpPath` combination.
 *
 * This error signals that:
 *
 * - The requested operation does not exist in the service's operations map
 * - The operation may have been removed, renamed, or the request is using incorrect identifiers
 * - The client should verify the operation ID, HTTP method, and path
 *
 * The error message includes the parameters used to search for the operation (operationId,
 * httpMethod, httpPath) formatted as JSON, which helps with debugging incorrect operation
 * requests or routing issues.
 */
class OperationNotFoundError extends CommonError {
  /**
   * Creates an instance of operation not found error.
   *
   * @param parameters - Record containing the operation search parameters:
   *                    - `operationId`: The operation identifier that was requested
   *                    - `httpMethod`: The HTTP method (GET, POST, PUT, DELETE, etc.)
   *                    - `httpPath`: The HTTP path that was requested
   *                    These are included in the error message as formatted JSON for debugging.
   */
  constructor(parameters: Record<string, unknown>) {
    const parametersJson = JSON.stringify(parameters, null, 2);
    super('OperationNotFoundError', `Operation not found, ${parametersJson}`);
  }

  /**
   * Returns the HTTP status code for this error (404 Not Found).
   *
   * @returns 404
   */
  get statusCode() {
    return 404;
  }
}

export default OperationNotFoundError;
