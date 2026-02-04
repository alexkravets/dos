import Component from '../Component';
import CommonError from './CommonError';

/**
 * Document Exists Error
 *
 * ## Intent
 *
 * `DocumentExistsError` represents a **422 Unprocessable Entity** error that occurs when
 * attempting to create a document that already exists in the system. This error is thrown
 * during create operations when a document with the same identifying attributes (typically
 * an ID or unique combination of fields) already exists.
 *
 * This error signals that:
 *
 * - The create operation cannot proceed because a document with the given parameters
 *   already exists
 * - The request is semantically correct but cannot be processed due to a conflict
 * - The client should either update the existing document or use different identifying
 *   parameters
 *
 * The error message includes the human-readable document title (e.g., "Profile", "Order item")
 * and the parameters that caused the conflict, formatted as JSON for debugging purposes.
 *
 * ## Use Cases
 *
 * 1. **Create operation conflicts**: When a `Create` operation attempts to create a document
 *    with an ID or unique attributes that already exist. The `Document.create()` method throws
 *    this error when `_create()` returns `false`, indicating the document already exists.
 *
 * 2. **Unique constraint violations**: When implementing custom create logic that checks for
 *    existing documents based on unique fields (e.g., email, username, composite keys) before
 *    creating a new document.
 *
 * 3. **Idempotency checks**: When ensuring that create operations are idempotent and should
 *    fail if a document with the same identifier already exists, rather than silently updating
 *    or creating duplicates.
 *
 * 4. **Data integrity enforcement**: When maintaining referential integrity or preventing
 *    duplicate entries based on business rules that require unique document identifiers.
 */
class DocumentExistsError extends CommonError {
  /**
   * Creates an instance of document exists error.
   *
   * @param Document - The document component class (e.g., Profile, Order) with a `name` property.
   *                   Used to generate a human-readable document title in the error message.
   * @param parameters - Record of parameters that caused the conflict (e.g., `{ id: '123' }`,
   *                    `{ email: 'user@example.com' }`). These are included in the error message
   *                    as formatted JSON for debugging.
   */
  constructor(Document: typeof Component, parameters: Record<string, unknown>) {
    const documentTitle = Document.getTitle();
    const jsonParameters = JSON.stringify(parameters, null, 2);

    super('DocumentExistsError', `${documentTitle} already exists ${jsonParameters}`);
  }
}

export default DocumentExistsError;
