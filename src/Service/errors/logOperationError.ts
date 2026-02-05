import Context from '../../Context';
import { pick } from 'lodash';
import maskSecrets from './maskSecrets';
import { ValidationError } from '@kravc/schema';

export type OriginalError = {
  code?: string;
  stack?: string;
  message: string;
  isCommonError?: boolean;
  validationErrors?: ValidationError[];
}

export type ErrorAttributes = {
  code: string;
  message: string;
  context: Record<string, unknown>;
  statusCode: number;
  validationErrors?: ValidationError[];
  originalError?: OriginalError;
}

const ERROR_CONTEXT_FIELDS = [
  'query',
  'mutation',
  'identity',
  'requestId',
  'operationId',
  'requestReceivedAt'
];

/**
 * Logs operation internal error with sanitized context and structured error information.
 *
 * Provides centralized, secure error logging for operation failures. Extracts relevant
 * context fields from the operation context, masks any secrets (passwords, tokens, etc.),
 * and logs structured error information. Distinguishes between expected/common errors
 * (which include full error details) and unexpected errors (which append stack traces
 * for debugging).
 *
 * This ensures that:
 * - Sensitive information is never logged in plain text
 * - Error logs contain sufficient context for debugging (request ID, operation ID, etc.)
 * - Unexpected errors are clearly marked with stack traces
 * - Common errors preserve their original error structure for analysis
 */
const logOperationError = (
  context: Context,
  errorAttributes: ErrorAttributes,
  originalError: OriginalError
) => {
  const { logger } = context;

  const unmaskedContext = pick(context, ERROR_CONTEXT_FIELDS);
  errorAttributes.context = maskSecrets(unmaskedContext);

  let unexpectedErrorMessage = '';

  const { isCommonError } = originalError;

  if (isCommonError) {
    errorAttributes.originalError = originalError;

  } else {
    unexpectedErrorMessage = `, Unexpected ${originalError.stack}`;
  }

  const errorAttributesJson = JSON.stringify(errorAttributes, null, 2);
  logger.error(`OperationError ${errorAttributesJson}${unexpectedErrorMessage}`);
};

export default logOperationError;
