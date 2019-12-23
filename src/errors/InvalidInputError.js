'use strict'

class InvalidInputError extends Error {
  constructor(validationError) {
    super('Invalid operation input')
    this._validationError = validationError
  }

  get code() {
    return this.constructor.name
  }

  get validationErrors() {
    return this._validationError.validationErrors
  }
}

module.exports = InvalidInputError
