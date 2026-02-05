import path from 'path';
import Component from '../../Component';
import { Context } from '../../Context';
import { loadSync } from '@kravc/schema';
import { OperationErrorAttibutes } from './OperationErrorAttributes';
import logOperationError, { type OriginalError, type ErrorAttributes } from './logOperationError';

const SCHEMA_PATH = path.resolve(__dirname) + '/OperationErrorAttributes.yaml';
const operationErrorSchema = loadSync(SCHEMA_PATH);

const INTERNAL_ERROR_CODE = 500;

/**
 * Operation Error
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
 */
class OperationError extends Component<OperationErrorAttibutes> {
  /** Returns schema of the operation error. */
  static get schema() {
    return operationErrorSchema;
  }

  /** Creates instance of an operation error. */
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
