'use strict'

class InvalidOutputError extends Error {
  constructor(invalidObject, validationError) {
    super('Invalid operation output')

    this._invalidObject   = invalidObject
    this._validationError = validationError
  }

  get code() {
    return this.constructor.name
  }

  get validationErrors() {
    return this._validationError.validationErrors
  }

  toJSON() {
    return {
      code:             this._validationError.code,
      message:          this._validationError.message,
      invalidObject:    this._invalidObject,
      validationErrors: this.validationErrors
    }
  }
}

module.exports = InvalidOutputError
