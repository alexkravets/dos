import CommonError from './CommonError';

/**
 * Access Denied Error
 *
 * `AccessDeniedError` represents a **403 Forbidden** error that occurs when a request
 * is authenticated (the user's identity is verified) but the user lacks the necessary
 * permissions to perform the requested operation. This is distinct from `UnauthorizedError`
 * (401), which indicates authentication failure (missing or invalid credentials).
 *
 * This error is thrown by security authorization classes (`JwtAuthorization`, `SystemAuthorization`)
 * when access verification fails. It signals that:
 *
 * - The request was properly authenticated (token/credentials were valid)
 * - The authenticated user/entity does not have permission to access the resource or operation
 * - The operation may be restricted to specific roles, scopes, or internal-only access
 */
class AccessDeniedError extends CommonError {
  /** Creates an instance of access denied error. */
  constructor(message: string) {
    super('AccessDeniedError', message);
  }
}

export default AccessDeniedError;
