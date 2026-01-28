/**
 * Common Error
 *
 * ## Intent
 *
 * `CommonError` is the base class for **expected**, domain-specific errors in operations
 * (e.g. document not found, invalid input, unauthorized). It establishes a consistent
 * contract: a machine-readable `code`, a human-readable `message`, and an `isCommonError`
 * flag. This allows the framework to:
 *
 * - **Preserve error details for clients**: Common errors are passed through `OperationError`
 *   and returned to callers with their original code and message, so clients can handle
 *   them explicitly (retry, show validation messages, etc.).
 * - **Separate expected from unexpected failures**: `OperationError` and `logOperationError`
 *   use `isCommonError` to treat common errors as "expected" (return as-is, log sparingly)
 *   and all other errors as "unexpected" (sanitize response, log fully for debugging).
 *
 * Subclass `CommonError` for any error that is part of your domain model and that callers
 * should receive verbatim. Do **not** use it for bugs, unhandled exceptions, or internal
 * failures—those remain generic "Unexpected operation error" to clients.
 *
 * ## Use Cases
 *
 * 1. **Domain error base class**: Extend `CommonError` to define operation-specific errors
 *    (e.g. `DocumentNotFoundError`, `InvalidInputError`, `UnauthorizedError`). Each subclass
 *    calls `super(code, message)` and can add extra properties (e.g. `validationErrors`).
 *
 * 2. **Expected vs unexpected error handling**: Handlers and middleware check `isCommonError`
 *    to decide whether to expose the error to clients or replace it with a generic message.
 *    Only errors extending `CommonError` (or objects with `isCommonError: true`) are
 *    considered common.
 *
 * 3. **Stable error codes for clients**: The `code` property gives clients a stable,
 *    programmatic way to branch on error type (e.g. `DocumentNotFoundError`, `InvalidInputError`)
 *    without parsing messages.
 */
class CommonError extends Error {
  private _code: string;

  /** Creates an instance of common error for a code and message. */
  constructor(code: string, message: string) {
    super(message);

    this._code = code;
  }

  /** Returns error code. */
  get code() {
    return this._code;
  }

  /** Flags if an error is a common error. */
  get isCommonError() {
    return true;
  }
}

export default CommonError;
