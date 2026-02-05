import CommonError from './CommonError';

/**
 * Unauthorized Error
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
 */
class UnauthorizedError extends CommonError {
  /** Creates an instance of unauthorized error. */
  constructor(message: string) {
    super('UnauthorizedError', message);
  }
}

export default UnauthorizedError;
