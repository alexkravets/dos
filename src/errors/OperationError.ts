import path from 'path';
import Component from '../Component';
import { Context } from '../Context';
import { loadSync } from '@kravc/schema';
import { OperationErrorAttibutes } from './OperationErrorAttributes';
import { logOperationError, type OriginalError, type ErrorAttributes } from '../helpers/error';

const SCHEMA_PATH = path.resolve(__dirname) + '/OperationErrorAttributes.yaml';
const operationErrorSchema = loadSync(SCHEMA_PATH);

const INTERNAL_ERROR_CODE = 500;

/**
 * Operation Error
 *
 * ## Intent
 *
 * `OperationError` is a standardized error component that wraps and formats errors
 * occurring during operation execution. It provides a consistent error response structure
 * across all operations, ensuring that:
 *
 * - Errors are validated against a schema before being returned to clients
 * - Unexpected errors (bugs, unhandled exceptions) are sanitized to prevent information
 *   leakage while still being logged for debugging
 * - Common/expected errors (like `DocumentNotFoundError`, `InvalidInputError`) preserve
 *   their original error details for proper client handling
 * - Internal server errors (500) are automatically logged with full context for debugging
 * - Validation errors are properly structured and included when present
 *
 * This class acts as the final error handler in the operation processing pipeline,
 * transforming any thrown error into a standardized, schema-validated response format.
 *
 * ## Use Cases
 *
 * 1. **Error response standardization**: Wrap any error thrown during operation execution
 *    into a consistent format that matches the OpenAPI specification. Used by `Service.process()`
 *    to ensure all error responses follow the same structure.
 *
 * 2. **Security and information hiding**: Sanitize unexpected errors (bugs, unhandled exceptions)
 *    by replacing their details with generic messages (`"Unexpected operation error"`) while
 *    preserving the original error information in logs. This prevents exposing internal
 *    implementation details, stack traces, or sensitive information to API clients.
 *
 * 3. **Error logging for debugging**: Automatically log internal server errors (status code 500)
 *    with full context (request ID, operation ID, query/mutation parameters, identity) for
 *    production debugging. Secrets in the context are automatically masked before logging.
 *
 * 4. **Validation error handling**: Preserve and structure validation errors from schema
 *    validation failures, allowing clients to understand which fields failed validation
 *    and why.
 *
 * 5. **Error type preservation**: Maintain the original error code and message for common
 *    errors (errors extending `CommonError`), allowing clients to handle specific error
 *    types appropriately (e.g., retry on 404, show validation errors on 400).
 */
class OperationError extends Component<OperationErrorAttibutes> {
  /** Returns schema of the operation error. */
  static get schema() {
    return operationErrorSchema;
  }

  /**
   * Creates instance of an operation error.
   *
   * @param context - The operation context containing validator, logger, and request metadata
   * @param statusCode - HTTP status code for the error response (400, 404, 500, etc.)
   * @param originalError - The original error that was thrown, containing code, message,
   *                        isCommonError flag, and optionally validationErrors
   */
  constructor(context: Context, statusCode: number, originalError: OriginalError) {
    const {
      code,
      message,
      isCommonError,
      validationErrors,
    } = originalError;

    const error = {
      code,
      message,
      statusCode,
    } as ErrorAttributes;

    if (validationErrors) {
      error.validationErrors = validationErrors;
    }

    const isUnexpectedError = !isCommonError;

    if (isUnexpectedError) {
      error.code = 'OperationError';
      error.message = 'Unexpected operation error';
    }

    const attributes = { error };
    super(context, attributes);

    const shouldLogError = statusCode === INTERNAL_ERROR_CODE;

    if (shouldLogError) {
      logOperationError(context, error, originalError);
    }
  }
}

export default OperationError;
