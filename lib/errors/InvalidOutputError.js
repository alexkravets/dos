'use strict'

class InvalidOutputError extends Error {
  constructor(validationError) {
    super('Invalid operation output')
    this._validationError = validationError
  }

  get code() {
    return this.constructor.name
  }

  get validationErrors() {
    return this._validationError.validationErrors
  }
}

module.exports = InvalidOutputError
