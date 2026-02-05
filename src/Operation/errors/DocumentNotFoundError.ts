import Component from '../../Component';
import CommonError from './CommonError';

/**
 * Document Not Found Error
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
 */
class DocumentNotFoundError extends CommonError {
  /** Creates an instance of document not found error. */
  constructor(Document: typeof Component, parameters: Record<string, unknown>) {
    const documentTitle = Document.getTitle();
    const jsonParameters = JSON.stringify(parameters, null, 2);

    super('DocumentNotFoundError', `${documentTitle} not found ${jsonParameters}`);
  }
}

export default DocumentNotFoundError;
