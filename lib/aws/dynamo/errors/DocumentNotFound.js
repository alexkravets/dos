'use strict'

class DocumentNotFoundError extends Error {
  constructor(name, error) {
    super(`${name} document not found`)

    this.code   = this.constructor.name
    this.status = 'Not Found'
    this.originalError = error
  }
}

module.exports = DocumentNotFoundError
