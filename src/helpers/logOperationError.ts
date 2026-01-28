import { pick } from 'lodash';
import maskSecrets from './maskSecrets';
import { Context, Logger } from '../Context';
import { got, ValidationError } from '@kravc/schema';

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
 * ## Intent
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
 *
 * ## Use Cases
 *
 * 1. **Internal server error logging**: Log 500 errors during operation execution with
 *    full context for debugging production issues.
 * 2. **Error monitoring and alerting**: Provide structured error logs that can be
 *    parsed by monitoring tools, log aggregators, or alerting systems.
 * 3. **Security compliance**: Ensure that credentials, tokens, or other secrets in
 *    context (query parameters, mutation inputs, identity) are never exposed in logs.
 * 4. **Debugging unexpected errors**: Capture stack traces for unexpected errors while
 *    preserving structured error information for expected/common errors.
 * 5. **Audit trails**: Maintain detailed error logs with request IDs, operation IDs,
 *    and timestamps for compliance and troubleshooting.
 *
 * ## Examples
 *
 * ### Logging a common error
 *
 * ```typescript
 * const context = {
 *   logger: { error: (msg) => console.error(msg) },
 *   validator: validator,
 *   query: { id: '123' },
 *   identity: { userId: 'u1', token: 'secret-token' },
 *   requestId: 'req_abc',
 *   operationId: 'ReadProfile',
 *   requestReceivedAt: new Date()
 * };
 *
 * const errorAttributes: ErrorAttributes = {
 *   code: 'DocumentNotFoundError',
 *   message: 'Profile not found',
 *   statusCode: 404,
 *   context: {}
 * };
 *
 * const originalError: OriginalError = {
 *   code: 'DocumentNotFoundError',
 *   message: 'Profile not found',
 *   isCommonError: true
 * };
 *
 * logOperationError(context, errorAttributes, originalError);
 * // Logs: OperationError {
 * //   "code": "DocumentNotFoundError",
 * //   "message": "Profile not found",
 * //   "statusCode": 404,
 * //   "context": {
 * //     "query": { "id": "123" },
 * //     "identity": { "userId": "u1", "token": "[MASKED]" },
 * //     "requestId": "req_abc",
 * //     "operationId": "ReadProfile",
 * //     "requestReceivedAt": "2026-01-28T..."
 * //   },
 * //   "originalError": {
 * //     "code": "DocumentNotFoundError",
 * //     "message": "Profile not found",
 * //     "isCommonError": true
 * //   }
 * // }
 * ```
 *
 * ### Logging an unexpected error
 *
 * ```typescript
 * const context = {
 *   logger: { error: (msg) => console.error(msg) },
 *   validator: validator,
 *   mutation: { email: 'user@example.com', password: 'secret123' },
 *   requestId: 'req_xyz',
 *   operationId: 'CreateProfile'
 * };
 *
 * const errorAttributes: ErrorAttributes = {
 *   code: 'OperationError',
 *   message: 'Unexpected operation error',
 *   statusCode: 500,
 *   context: {}
 * };
 *
 * const originalError: OriginalError = {
 *   message: 'Cannot read property "id" of undefined',
 *   stack: 'Error: Cannot read property "id" of undefined\n    at ...'
 *   // isCommonError is undefined/false
 * };
 *
 * logOperationError(context, errorAttributes, originalError);
 * // Logs: OperationError {
 * //   "code": "OperationError",
 * //   "message": "Unexpected operation error",
 * //   "statusCode": 500,
 * //   "context": {
 * //     "mutation": { "email": "user@example.com", "password": "[MASKED]" },
 * //     "requestId": "req_xyz",
 * //     "operationId": "CreateProfile"
 * //   }
 * // }, Unexpected Error: Cannot read property "id" of undefined
 * //     at ...
 * ```
 *
 * ### Usage in OperationError class
 *
 * ```typescript
 * class OperationError extends Component {
 *   constructor(context: Context, statusCode: number, originalError: OriginalError) {
 *     // ... build errorAttributes ...
 *
 *     const shouldLogError = statusCode === 500;
 *
 *     if (shouldLogError) {
 *       logOperationError(context, errorAttributes, originalError);
 *     }
 *   }
 * }
 * ```
 *
 * ### Logging validation errors
 *
 * ```typescript
 * const originalError: OriginalError = {
 *   message: 'Validation failed',
 *   isCommonError: true,
 *   validationErrors: [
 *     { path: 'email', message: 'Invalid email format' },
 *     { path: 'age', message: 'Must be a number' }
 *   ]
 * };
 *
 * const errorAttributes: ErrorAttributes = {
 *   code: 'InvalidInputError',
 *   message: 'Validation failed',
 *   statusCode: 400,
 *   validationErrors: originalError.validationErrors,
 *   context: {}
 * };
 *
 * logOperationError(context, errorAttributes, originalError);
 * // Includes validationErrors in both errorAttributes and originalError
 * ```
 */
const logOperationError = (
  context: Context,
  errorAttributes: ErrorAttributes,
  originalError: OriginalError
) => {
  const logger = got(context, 'logger') as Logger;

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
