import CommonError from './CommonError';
import getComponentTitle from '../helpers/getComponentTitle';

/**
 * Document Not Found Error
 *
 * ## Intent
 *
 * `DocumentNotFoundError` represents a **404 Not Found** error that occurs when attempting
 * to access a document that does not exist in the system. This error is thrown during read,
 * update, and delete operations when a document matching the provided query parameters cannot
 * be found.
 *
 * This error signals that:
 *
 * - The requested document does not exist with the given identifying parameters (typically
 *   an ID or unique combination of fields)
 * - The operation cannot proceed because the target document is missing
 * - The client should verify the document identifier or check if the document was deleted
 *   or never created
 *
 * The error message includes the human-readable document title (e.g., "Profile", "Order item")
 * and the query parameters that were used to search for the document, formatted as JSON for
 * debugging purposes.
 *
 * ## Use Cases
 *
 * 1. **Read operation failures**: When a `Read` operation attempts to retrieve a document
 *    by ID or query parameters, and `Document.read()` throws this error because `_read()`
 *    returns `null` or `undefined`, indicating no matching document exists.
 *
 * 2. **Update operation failures**: When an `Update` operation attempts to modify a document
 *    that doesn't exist. The `Document.update()` method calls `read()` first to ensure the
 *    document exists, which throws `DocumentNotFoundError` if not found.
 *
 * 3. **Delete operation failures**: When a `Delete` operation attempts to remove a document
 *    that doesn't exist. The `Document.delete()` method calls `read()` first to ensure the
 *    document exists, which throws `DocumentNotFoundError` if not found.
 *
 * 4. **Custom query validation**: When implementing custom read logic that checks for document
 *    existence before performing operations, or when validating that referenced documents exist
 *    before creating relationships.
 */
class DocumentNotFoundError extends CommonError {
  /**
   * Creates an instance of document not found error.
   *
   * @param Document - The document component class (e.g., Profile, Order) with a `name` property.
   *                   Used to generate a human-readable document title in the error message.
   * @param parameters - Record of query parameters used to search for the document (e.g., `{ id: '123' }`,
   *                    `{ email: 'user@example.com' }`). These are included in the error message
   *                    as formatted JSON for debugging.
   */
  constructor(Document: { name: string }, parameters: Record<string, unknown>) {
    const documentTitle = getComponentTitle(Document);
    const jsonParameters = JSON.stringify(parameters, null, 2);

    super('DocumentNotFoundError', `${documentTitle} not found ${jsonParameters}`);
  }
}

export default DocumentNotFoundError;
