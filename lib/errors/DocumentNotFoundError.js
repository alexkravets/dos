'use strict'

class DocumentNotFoundError extends Error {
  constructor(name, error) {
    super(`${name} document is not found`)

    this.code   = 'DOCUMENT_NOT_FOUND'
    this.status = 'Not Found'

    if (error) {
      this.originalErrors = [ error ]
    }
  }
}

module.exports = DocumentNotFoundError
