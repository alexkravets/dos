import Component from '../../Component';
import CommonError from './CommonError';

/**
 * Document Exists Error
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
 */
class DocumentExistsError extends CommonError {
  /** Creates an instance of document exists error. */
  constructor(Document: typeof Component, parameters: Record<string, unknown>) {
    const documentTitle = Document.getTitle();
    const jsonParameters = JSON.stringify(parameters, null, 2);

    super('DocumentExistsError', `${documentTitle} already exists ${jsonParameters}`);
  }
}

export default DocumentExistsError;
