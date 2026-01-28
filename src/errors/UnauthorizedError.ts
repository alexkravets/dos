import CommonError from './CommonError';

/**
 * Unauthorized Error
 *
 * ## Intent
 *
 * `UnauthorizedError` represents a **401 Unauthorized** error that occurs when authentication
 * fails—the request lacks valid credentials or the provided credentials are invalid. This is
 * distinct from `AccessDeniedError` (403), which indicates that authentication succeeded but
 * authorization failed (the user lacks permissions).
 *
 * This error signals that:
 *
 * - The request is missing required authentication credentials (e.g., Authorization header, token)
 * - The provided credentials are invalid, expired, or malformed
 * - The client must provide valid authentication before the request can proceed
 *
 * This error is thrown by security authorization classes (`JwtAuthorization`, `SystemAuthorization`)
 * during the authentication phase, before any operation logic executes. The framework automatically
 * returns this error with a 401 status code, indicating that the client needs to authenticate.
 *
 * ## Use Cases
 *
 * 1. **Missing authentication credentials**: When a request requires authentication but no
 *    credentials are provided. For example, `JwtAuthorization` throws this error when the
 *    Authorization header is missing: `Header "authorization" is missing`.
 *
 * 2. **Invalid token format**: When authentication credentials are provided but cannot be parsed
 *    or decoded. For example, `JwtAuthorization` throws this error when a JWT token cannot be
 *    decoded: `Invalid authorization token`.
 *
 * 3. **Token verification failures**: When credentials are provided and parsed correctly, but
 *    verification fails (e.g., invalid signature, expired token, wrong algorithm). The error
 *    message includes details about why verification failed (e.g., `Token expired`, `Invalid signature`).
 *
 * 4. **Client authentication handling**: Clients can check for `UnauthorizedError` (code: 'UnauthorizedError',
 *    statusCode: 401) to detect authentication failures and prompt users to re-authenticate,
 *    refresh tokens, or provide valid credentials.
 */
class UnauthorizedError extends CommonError {
  /**
   * Creates an instance of unauthorized error.
   *
   * @param message - Human-readable error message describing why authentication failed.
   *                  Should be specific about the authentication issue (e.g., 'Header "authorization" is missing',
   *                  'Invalid authorization token', 'Token expired'). This message is returned
   *                  to the client, so it should be informative but not expose sensitive details.
   */
  constructor(message: string) {
    super('UnauthorizedError', message);
  }
}

export default UnauthorizedError;
