import CommonError from './CommonError';

/**
 * Access Denied Error
 *
 * ## Intent
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
 *
 * ## Use Cases
 *
 * 1. **JWT authorization failures**: When a JWT token is valid but the user's payload (roles,
 *    scopes, permissions) doesn't grant access to the requested operation. The `accessVerificationMethod`
 *    in `JwtAuthorization` returns `[false, message]` when access should be denied.
 *
 * 2. **System/internal-only operations**: When an external request attempts to access an operation
 *    that is restricted to internal/system requests only. `SystemAuthorization` throws this error
 *    when external requests (those with headers) try to access internal-only endpoints.
 *
 * 3. **Role-based access control (RBAC)**: When implementing fine-grained permissions where
 *    certain operations require specific roles or permissions that the authenticated user
 *    doesn't possess.
 *
 * 4. **Scope-based authorization**: When OAuth2-style scopes are used and the token doesn't
 *    include the required scope for the operation.
 */
class AccessDeniedError extends CommonError {
  /**
   * Creates an instance of access denied error.
   *
   * @param message - Human-readable error message describing why access was denied.
   *                  Defaults to 'Operation access denied' if not provided.
   */
  constructor(message: string = 'Operation access denied') {
    super('AccessDeniedError', message);
  }
}

export default AccessDeniedError;
